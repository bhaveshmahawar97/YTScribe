import { YoutubeTranscript } from "youtube-transcript";
import Transcript from "../models/transcriptModel.js";
import path from "path";
import fs from "fs";
import fse from "fs-extra";
import youtubedl from "youtube-dl-exec";
import { createClient as createDeepgramClient } from "@deepgram/sdk";

// Convert Deepgram response to our segments format
function mapDeepgramToSegments(dgRes) {
  try {
    const segments = [];
    const channels = dgRes?.results?.channels || [];
    if (!channels.length) return segments;
    const alt = channels[0]?.alternatives?.[0] || {};

    // Prefer paragraphs if available
    const paras = alt?.paragraphs?.paragraphs;
    if (Array.isArray(paras) && paras.length) {
      for (const p of paras) {
        const text = (p?.sentences || [])
          .map((s) => (s?.text || '').trim())
          .filter(Boolean)
          .join(' ')
          .trim();
        const start = typeof p?.start === 'number' ? p.start : 0;
        const end = typeof p?.end === 'number' ? p.end : start;
        const duration = Math.max(0, end - start);
        if (text) segments.push({ text, start, duration });
      }
      return segments;
    }

    // Fallback to words grouping: join into ~10s chunks
    const words = alt?.words || [];
    if (Array.isArray(words) && words.length) {
      let bucket = [];
      let bucketStart = typeof words[0]?.start === 'number' ? words[0].start : 0;
      for (const w of words) {
        const st = typeof w?.start === 'number' ? w.start : 0;
        const ed = typeof w?.end === 'number' ? w.end : st;
        bucket.push(w?.punctuated_word || w?.word || '');
        // flush about every 10 seconds or on punctuation
        const shouldFlush = (ed - bucketStart) >= 10 || /[.!?]$/.test(w?.punctuated_word || '');
        if (shouldFlush) {
          const text = bucket.join(' ').trim();
          if (text) segments.push({ text, start: bucketStart, duration: Math.max(0, ed - bucketStart) });
          bucket = [];
          bucketStart = ed;
        }
      }
      // remaining
      if (bucket.length) {
        const lastEnd = typeof words[words.length - 1]?.end === 'number' ? words[words.length - 1].end : bucketStart;
        const text = bucket.join(' ').trim();
        if (text) segments.push({ text, start: bucketStart, duration: Math.max(0, lastEnd - bucketStart) });
      }
      return segments;
    }

    // Last resort: whole transcript string
    const transcript = alt?.transcript || dgRes?.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';
    if (transcript) {
      segments.push({ text: String(transcript).trim(), start: 0, duration: 0 });
    }
    return segments;
  } catch {
    return [];
  }
}

/**
 * Extract YouTube video ID from URL
 */
export function extractYouTubeId(input) {
  try {
    if (!input) return null;

    // If a bare ID is passed
    if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input;

    const url = new URL(input);

    // Standard watch URL: v=ID
    const v = url.searchParams.get("v");
    if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;

    // youtu.be/ID
    const youtuMatch = url.hostname.includes("youtu.be")
      ? url.pathname.split("/").filter(Boolean)[0]
      : null;
    if (youtuMatch && /^[a-zA-Z0-9_-]{11}$/.test(youtuMatch)) return youtuMatch;

    // /embed/ID or /shorts/ID or /v/ID
    const pathParts = url.pathname.split("/").filter(Boolean);
    const candidates = ["embed", "shorts", "v"];
    if (pathParts.length >= 2 && candidates.includes(pathParts[0])) {
      const id = pathParts[1];
      if (/^[a-zA-Z0-9_-]{11}$/.test(id)) return id;
    }

    // Last path segment as a fallback (e.g., /ID?list=...)
    if (pathParts.length >= 1) {
      const last = pathParts[pathParts.length - 1];
      if (/^[a-zA-Z0-9_-]{11}$/.test(last)) return last;
    }

    return null;
  } catch {
    // Not a valid URL string; if looks like ID, return it
    return /^[a-zA-Z0-9_-]{11}$/.test(input) ? input : null;
  }
}

/**
 * Main transcription handler (FREE, NO API KEY)
 */
export const createYoutubeTranscript = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "YouTube URL is required" });
    }

    const videoId = extractYouTubeId(url);
    if (!videoId) {
      return res.status(400).json({ error: "Invalid YouTube URL" });
    }

    // Step A: cache check
    const existing = await Transcript.findOne({ videoId }).lean();
    if (existing) {
      // normalize segments from rawTranscript
      const raw0 = Array.isArray(existing.rawTranscript) ? existing.rawTranscript : [];
      const segments0 = raw0.map((s) => ({
        text: s.text ?? "",
        start: typeof s.start === "number" ? s.start : typeof s.offset === "number" ? s.offset : 0,
        duration: typeof s.duration === "number" ? s.duration : typeof s.dur === "number" ? s.dur : 0,
      }));
      return res.status(200).json({
        message: "Transcript fetched from cache",
        transcript: existing.text,
        fullText: existing.text,
        segments: segments0,
        transcriptId: existing._id.toString(),
      });
    }

    // Step B: try free captions via youtube-transcript
    let raw = [];
    try {
      raw = await YoutubeTranscript.fetchTranscript(videoId);
      if (Array.isArray(raw) && raw.length > 0) {
        const segments = raw.map((s) => ({
          text: s.text ?? "",
          start: typeof s.start === "number" ? s.start : typeof s.offset === "number" ? s.offset : 0,
          duration: typeof s.duration === "number" ? s.duration : typeof s.dur === "number" ? s.dur : 0,
        }));
        const fullText = segments.map((s) => s.text).join(" ");

        const doc = await Transcript.create({ videoId, text: fullText, rawTranscript: raw });
        return res.status(200).json({
          message: "Transcript generated successfully",
          transcript: fullText,
          fullText,
          segments,
          transcriptId: doc._id.toString(),
        });
      }
      // if empty array, fall through to fallback
    } catch (e) {
      // Continue to fallback
      console.warn("youtube-transcript failed; attempting Deepgram fallback", e?.message);
    }

    // Step C: Fallback — download audio and transcribe with Deepgram
    const apiKey = process.env.DEEPGRAM_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Deepgram API key not configured" });
    }

    const deepgram = createDeepgramClient(apiKey);
    const tempRoot = path.join(process.cwd(), "temp");
    await fse.ensureDir(tempRoot);
    const tempName = `${videoId}-${Date.now()}.m4a`;
    const tempFile = path.join(tempRoot, tempName);

    try {
      // Download best audio track as m4a
      await youtubedl(url, {
        extractAudio: true,
        audioFormat: "m4a",
        audioQuality: 0,
        output: tempFile,
        noCheckCertificates: true,
        noWarnings: true,
        preferFreeFormats: true,
        verbose: false,
        // retries to be safe
        retries: 3,
      });

      if (!fs.existsSync(tempFile)) {
        throw new Error("Audio download failed");
      }

      const stream = fs.createReadStream(tempFile);
      const dgRes = await deepgram.listen.prerecorded.transcribeFile(stream, {
        model: "nova-2",
        smart_format: true,
        punctuate: true,
      });

      // Map Deepgram response into segments
      const segments = mapDeepgramToSegments(dgRes);
      const fullText = segments.map((s) => s.text).join(" ");
      const doc = await Transcript.create({ videoId, text: fullText, rawTranscript: segments });

      return res.status(200).json({
        message: "Transcript generated via AI fallback",
        transcript: fullText,
        fullText,
        segments,
        transcriptId: doc._id.toString(),
      });
    } catch (e) {
      console.error("Fallback transcription error:", e);
      return res.status(500).json({ error: "Server error generating transcript via AI" });
    } finally {
      // Cleanup
      try {
        if (fs.existsSync(tempFile)) await fse.remove(tempFile);
      } catch {}
    }
  } catch (err) {
    console.error("Transcript error:", err);
    return res.status(500).json({ error: "Server error generating transcript" });
  }
};

export const getTranscriptById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Transcript ID is required" });

    const doc = await Transcript.findById(id).lean();
    if (!doc) return res.status(404).json({ error: "Transcript not found" });

    // Normalize segments from rawTranscript for response
    const raw = Array.isArray(doc.rawTranscript) ? doc.rawTranscript : [];
    const segments = raw.map((s) => ({
      text: s.text ?? "",
      start: typeof s.start === "number" ? s.start : typeof s.offset === "number" ? s.offset : 0,
      duration: typeof s.duration === "number" ? s.duration : typeof s.dur === "number" ? s.dur : 0,
    }));

    return res.status(200).json({
      transcriptId: doc._id.toString(),
      videoId: doc.videoId,
      transcript: doc.text,
      segments,
      rawTranscript: doc.rawTranscript,
    });
  } catch (err) {
    console.error("Get transcript error:", err);
    return res.status(500).json({ error: "Server error fetching transcript" });
  }
};
