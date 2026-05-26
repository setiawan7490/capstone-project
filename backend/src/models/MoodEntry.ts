import mongoose, { Schema, Document } from 'mongoose';
import { EmotionType, EmotionScore } from '../types';

export interface IMoodEntryDocument extends Document {
  userId: mongoose.Types.ObjectId;
  dominantEmotion: EmotionType;
  dominantConfidence: number;
  allEmotions: EmotionScore[];
  detectedAt: Date;
  source: 'camera' | 'upload';
  imageUrl?: string;        // URL publik untuk frontend: /api/images/:gridfsId
  imageGridFsId?: string;   // ObjectId GridFS — dipakai untuk delete & serve
  createdAt: Date;
}

const EmotionScoreSchema = new Schema<EmotionScore>(
  { emotion: { type: String, required: true }, confidence: { type: Number, required: true } },
  { _id: false }
);

const MoodEntrySchema = new Schema<IMoodEntryDocument>({
  userId:             { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  imageUrl:           { type: String, default: null },
  imageGridFsId:      { type: String, default: null },
  dominantEmotion:    { type: String, required: true },
  dominantConfidence: { type: Number, required: true },
  allEmotions:        { type: [EmotionScoreSchema], required: true },
  detectedAt:         { type: Date, default: Date.now },
  source:             { type: String, enum: ['camera', 'upload'], default: 'camera' },
  imageUrl:           { type: String, default: null },
  imageGridFsId:      { type: String, default: null },
}, { timestamps: true, versionKey: false });

MoodEntrySchema.index({ userId: 1, detectedAt: -1 });
export default mongoose.model<IMoodEntryDocument>('MoodEntry', MoodEntrySchema);
