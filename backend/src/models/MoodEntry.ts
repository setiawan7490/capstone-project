import mongoose, { Schema, Document } from 'mongoose';
import { EmotionType, EmotionScore } from '../types';

export interface IMoodEntryDocument extends Document {
  dominantEmotion: EmotionType;
  dominantConfidence: number;
  allEmotions: EmotionScore[];
  detectedAt: Date;
  source: 'camera' | 'upload';
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EmotionScoreSchema = new Schema<EmotionScore>(
  {
    emotion: {
      type: String,
      enum: ['Happy', 'Sad', 'Angry', 'Fear', 'Surprise', 'Neutral'],
      required: true,
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
  },
  { _id: false }
);

const MoodEntrySchema = new Schema<IMoodEntryDocument>(
  {
    dominantEmotion: {
      type: String,
      enum: ['Happy', 'Sad', 'Angry', 'Fear', 'Surprise', 'Neutral'],
      required: true,
    },
    dominantConfidence: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    allEmotions: {
      type: [EmotionScoreSchema],
      required: true,
    },
    detectedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    source: {
      type: String,
      enum: ['camera', 'upload'],
      required: true,
      default: 'camera',
    },
    imageUrl: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Index untuk query yang sering dipakai
MoodEntrySchema.index({ detectedAt: -1 });
MoodEntrySchema.index({ dominantEmotion: 1 });
MoodEntrySchema.index({ source: 1 });

const MoodEntry = mongoose.model<IMoodEntryDocument>('MoodEntry', MoodEntrySchema);

export default MoodEntry;