import { YoutubeTranscript } from "youtube-transcript";
import Transcript from "../models/transcriptModel.js";
import path from "path";
import fs from "fs";
import fse from "fs-extra";
import youtubedl from "youtube-dl-exec";
import { createClient as createDeepgramClient } from "@deepgram/sdk";

/**
 * Helper: Convert Deepgram response to our segments format
 */
function mapDeepgramToSegments(dgRes) {
  try {
    const segments = [];
    const resultsRoot = dgRes?.result?.results || dgRes?.results || {};
    const channels = resultsRoot?.channels || [];
    if (!channels.length) return segments;
    const alt = channels[0]?.alternatives?.[0] || {};

    // 1. Prefer paragraphs (better semantic grouping)
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
        if (text) segments.push({ text, offset: start * 1000, duration: duration * 1000 }); // Convert to ms
      }
      return segments;
    }

    // 2. Fallback to words
    const words = alt?.words || [];
    if (Array.isArray(words) && words.length) {
      let bucket = [];
      let bucketStart = typeof words[0]?.start === 'number' ? words[0].start : 0;
      
      for (const w of words) {
        const st = typeof w?.start === 'number' ? w.start : 0;
        const ed = typeof w?.end === 'number' ? w.end : st;
        
        bucket.push(w?.punctuated_word || w?.word || '');
        
        // Flush every ~10 seconds or on sentence endings
        const shouldFlush = (ed - bucketStart) >= 10 || /[.!?]$/.test(w?.punctuated_word || '');
        
        if (shouldFlush) {
          const text = bucket.join(' ').trim();
          if (text) {
            segments.push({ 
              text, 
              offset: bucketStart * 1000, 
              duration: Math.max(0, (ed - bucketStart) * 1000) 
            });
          }
          bucket = [];
          bucketStart = ed;
        }
      }
      // Flush remaining
      if (bucket.length) {
        const lastEnd = typeof words[words.length - 1]?.end === 'number' ? words[words.length - 1].end : bucketStart;
        const text = bucket.join(' ').trim();
        if (text) {
          segments.push({ 
            text, 
            offset: bucketStart * 1000, 
            duration: Math.max(0, (lastEnd - bucketStart) * 1000) 
          });
        }
      }
      return segments;
    }

    return segments;
  } catch (e) {
    console.error("Mapping error:", e);
    return [];
  }
}

/**
 * Helper: Extract YouTube ID
 */
export function extractYouTubeId(input) {
  try {
    if (!input) return null;
    if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input;
    const url = new URL(input);
    const v = url.searchParams.get("v");
    if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.includes("embed") || parts.includes("shorts") || parts.includes("v")) {
      return parts[parts.length - 1];
    }
    if (url.hostname.includes("youtu.be")) return parts[0];
    return null;
  } catch {
    return /^[a-zA-Z0-9_-]{11}$/.test(input) ? input : null;
  }
}

/**
 * Main Controller
 */
export const createYoutubeTranscript = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "YouTube URL is required" });

    const videoId = extractYouTubeId(url);
    if (!videoId) return res.status(400).json({ error: "Invalid YouTube URL" });

    // ---------------------------------------------------------
    // STEP A: Check Cache (MongoDB)
    // ---------------------------------------------------------
    const existing = await Transcript.findOne({ videoId }).lean();
    if (existing) {
      const segments = (existing.rawTranscript || []).map(s => ({
        text: s.text || "",
        offset: s.offset || s.start || 0,
        duration: s.duration || s.dur || 0
      }));
      return res.status(200).json({
        message: "Fetched from cache",
        transcript: existing.text,
        segments,
        transcriptId: existing._id.toString()
      });
    }

    // ---------------------------------------------------------
    // STEP B: Try Free Scraping (youtube-transcript)
    // ---------------------------------------------------------
    try {
      const raw = await YoutubeTranscript.fetchTranscript(videoId);
      if (raw && raw.length > 0) {
        const fullText = raw.map(s => s.text).join(" ");
        const doc = await Transcript.create({ videoId, text: fullText, rawTranscript: raw });
        
        return res.status(200).json({
          message: "Scraped successfully",
          source: 'scrape',
          transcript: fullText,
          segments: raw,
          transcriptId: doc._id.toString()
        });
      }
    } catch (e) {
      console.warn(`[Transcript] Scraping failed for ${videoId}. Switching to AI fallback.`);
    }

    // ---------------------------------------------------------
    // STEP C: AI Fallback (Deepgram + yt-dlp)
    // ---------------------------------------------------------
    const apiKey = process.env.DEEPGRAM_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Deepgram API key missing" });

    const deepgram = createDeepgramClient(apiKey);
    const tempRoot = path.resolve(process.cwd(), "temp"); // Absolute path is safer
    await fse.ensureDir(tempRoot);
    
    const tempName = `${videoId}-${Date.now()}.m4a`;
    const tempFile = path.join(tempRoot, tempName);

    try {
      console.log(`[Fallback] Downloading audio to: ${tempFile}`);

      // FIXED: Removed 'noVerbose' and 'pythonPath' flags
      await youtubedl(url, {
        extractAudio: true,
        audioFormat: "m4a",
        audioQuality: 0,
        output: tempFile,
        noCheckCertificates: true,
        noWarnings: true,
        preferFreeFormats: true,
        retries: 3,
        ffmpegLocation: 'C:\\Users\\rajes\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.0.1-full_build\\bin',
        addHeader: ['referer:youtube.com', 'user-agent:googlebot']
      });

      if (!fs.existsSync(tempFile)) throw new Error("Audio file not created");

      console.log(`[Fallback] Transcribing with Deepgram...`);
      const stream = fs.createReadStream(tempFile);
      
      const { result, error } = await deepgram.listen.prerecorded.transcribeFile(stream, {
        model: "nova-2",
        smart_format: true,
        punctuate: true,
      });
      console.log("Deepgram Response keys:", Object.keys(result || {}));
      console.log("Deepgram Channels:", JSON.stringify(result?.results?.channels?.[0]?.alternatives?.[0]?.words?.slice(0, 5) || "No words found"));

      const segments = mapDeepgramToSegments(result || {});

      const fullText = segments.map(s => s.text).join(" ").trim();

      // If AI produced no usable text, don't save an empty doc
      if (!fullText || !fullText.trim()) {
        console.warn("[Transcript] No speech detected in audio.");
        // Optional: Save a placeholder or return specific error
        return res.status(200).json({ 
          message: "No speech detected in this video.", 
          transcript: "No speech detected.", 
          segments: [],
          source: "ai"
        });
      }

      const doc = await Transcript.create({ videoId, text: fullText, rawTranscript: segments });

      return res.status(200).json({
        message: "Generated via AI",
        source: 'ai',
        transcript: fullText,
        segments,
        transcriptId: doc._id.toString()
      });

    } catch (fallbackErr) {
      console.error("[Fallback Error]", fallbackErr);
      return res.status(500).json({ error: "Failed to transcribe via AI" });
    } finally {
      // Cleanup temp file
      if (await fse.pathExists(tempFile)) {
        await fse.remove(tempFile);
      }
    }

  } catch (err) {
    console.error("[Transcript Controller] Error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * Get by ID
 */
export const getTranscriptById = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Transcript.findById(id).lean();
    if (!doc) return res.status(404).json({ error: "Not found" });

    return res.status(200).json({
      transcriptId: doc._id,
      videoId: doc.videoId,
      transcript: doc.text,
      segments: doc.rawTranscript
    });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
};