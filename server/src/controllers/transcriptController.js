import OpenAI from 'openai';
import { toFile } from 'openai/uploads';
import ytdl from '@distube/ytdl-core';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import { PassThrough } from 'stream';
import Transcript from '../models/transcriptModel.js';

ffmpeg.setFfmpegPath(ffmpegStatic);

let openaiClient = null;
function getOpenAI() {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not set');
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

function isValidYoutubeUrl(url) {
  try {
    const u = new URL(url);
    return (
      ['www.youtube.com', 'youtube.com', 'm.youtube.com', 'youtu.be'].includes(u.hostname) &&
      (u.pathname === '/watch' || u.hostname === 'youtu.be' || u.pathname.startsWith('/shorts'))
    );
  } catch {
    return false;
  }
}

function getVideoIdFromUrl(url) {
  if (ytdl.validateURL(url)) return ytdl.getURLVideoID(url);
  return null;
}

function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', (err) => reject(err));
  });
}

async function downloadAndTranscodeToMp3Buffer(url) {
  return new Promise((resolve, reject) => {
    try {
      const audioStream = ytdl(url, {
        quality: 'highestaudio',
        filter: 'audioonly',
        requestOptions: {
          headers: {
            'user-agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
              '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'accept-language': 'en-US,en;q=0.9',
          },
        },
      });

      const pass = new PassThrough();
      ffmpeg(audioStream)
        .setFfmpegPath(ffmpegStatic)
        .audioCodec('libmp3lame')
        .format('mp3')
        .on('error', (err) => reject(err))
        .pipe(pass, { end: true });

      streamToBuffer(pass).then(resolve).catch(reject);
    } catch (e) {
      reject(e);
    }
  });
}

export async function createYoutubeTranscript(req, res) {
  try {
    const { url, withTimestamps } = req.body || {};

    if (!url || !ytdl.validateURL(url)) {
      return res.status(400).json({ success: false, message: 'Invalid YouTube URL' });
    }

    const videoId = getVideoIdFromUrl(url);
    if (!videoId) {
      return res.status(400).json({ success: false, message: 'Could not extract video ID' });
    }

    let info = null;
    try {
      info = await ytdl.getInfo(url);
    } catch {
      // ignore title fetch errors
    }
    const videoTitle = info?.videoDetails?.title || `YouTube Video ${videoId}`;

    const mp3Buffer = await downloadAndTranscodeToMp3Buffer(url);

    const responseFormat = withTimestamps ? 'verbose_json' : 'text';

    const file = await toFile(mp3Buffer, 'audio.mp3', { type: 'audio/mpeg' });

    const openai = getOpenAI();
    const transcript = await openai.audio.transcriptions.create({
      file,
      model: 'gpt-4o-mini-transcribe',
      response_format: responseFormat,
    });

    let fullText = '';
    let segments = [];

    if (withTimestamps) {
      fullText = transcript?.text || '';
      if (Array.isArray(transcript?.segments)) {
        segments = transcript.segments.map((s) => ({ start: s.start, end: s.end, text: s.text }));
      }
    } else {
      fullText = typeof transcript === 'string' ? transcript : transcript?.text || '';
    }

    const doc = await Transcript.create({
      user: req.user?._id || null,
      videoId,
      videoUrl: url,
      title: videoTitle,
      fullText,
      segments,
      createdAt: new Date(),
    });

    return res.json({
      success: true,
      transcriptId: doc._id.toString(),
      fullText: doc.fullText,
      segments: doc.segments,
      title: doc.title,
    });
  } catch (error) {
    console.error('Transcription error:', error);
    return res.status(500).json({
      success: false,
      message: 'Transcription failed. Please try another video or try again later.',
      error: error?.message || 'Unknown error',
    });
  }
}

export const generateYoutubeTranscript = createYoutubeTranscript;

export async function getTranscriptById(req, res) {
  const { id } = req.params;
  try {
    const doc = await Transcript.findById(id);
    if (!doc) return res.status(404).json({ success: false, message: 'Transcript not found' });
    return res.json({
      success: true,
      transcriptId: doc._id.toString(),
      fullText: doc.fullText,
      segments: doc.segments,
      title: doc.title,
      videoUrl: doc.videoUrl,
      createdAt: doc.createdAt,
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Failed to fetch transcript' });
  }
}
