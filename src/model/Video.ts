import { v4 as uuidv4 } from 'uuid'
import { Document, Schema, model } from "mongoose";

export interface IVideo extends Document {
  title: string;
  description: string;
  filePath: string;
  thumbnailPath: string;
  size: number;
  format: string;
  uploadTime: Date;
  processsingDetails: {
    startedAt: Date;
    finishedAt: Date;
  };
  processingTime: string;
  status: Status;
  uploadedAt: Date;
}

export enum Status {
  UPLOADED = "UPLOADED",
  PROCESSING = "PROCESSING",
  GENERATED = "GENERATED",
  FAILED = "FAILED",
}

const VideoSchema = new Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4(),
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    filePath: { type: String, required: true },
    thumbnailPath: { type: String },
    size: { type: Number, required: true },
    format: { type: String, required: true },
    uploadTime: { type: String, required: true },
    processsingDetails: {
      startedAt: { type: Date, default: null },
      finishedAt: { type: Date, default: null },
    },
    processingTime:{ type:String, default: null },
    status: {
      type: String,
      enum: Object.values(Status),
      required: true,
    },
    uploadedAt: { type: Date, required: true },
  },
  {
    timestamps: true,
  }
);

export const Video = model<IVideo>("Video", VideoSchema);
