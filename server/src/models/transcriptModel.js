import mongoose from 'mongoose';

const SegmentSchema = new mongoose.Schema(
  {
    start: { type: Number },
    end: { type: Number },
    text: { type: String },
  },
  { _id: false }
);

const TranscriptSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    videoId: { type: String, required: true },
    videoUrl: { type: String, required: true },
    title: { type: String },
    fullText: { type: String, required: true },
    segments: { type: [SegmentSchema], default: [] },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

const Transcript = mongoose.model('Transcript', TranscriptSchema);
export default Transcript;
