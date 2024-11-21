import { randomUUID } from "crypto";
import { Document, Schema, model } from "mongoose";

interface IVideo extends Document {
    id: string;
    title: string;
    description: string;
    filePath: string;
    thumbnailPath: string;
    size: number;
    format: string;
    uploadTime: Date;
    processsingDetails: Object;
    status: Status;
    updatedAt: Date;
}

enum Status {
    UPLOADED = "UPLOADED",
    PROCESSING = "PROCESSING",
    GENERATED = "GENERATED",
    FAILED = "FAILED",
}

const VideoSchema = new Schema({
    id: { type: String, required: true, unique: true, default: randomUUID() },
    title: { type: String, required: true },
    description: { type: String, required: true },
    filePath: { type: String, required: true },
    thumbnailPath: { type: String },
    size: { type: Number, required: true },
    format: { type: String, required: true },
    uploadTime: { type: Date, required: true },
    processsingDetails: {
        startedAt: { type: Date, required: true },
        completedAt: { type: Date },
    },
    status: { type: String, required: true },
    updatedAt: { type: Date, required: true },
});

export const Video = model<IVideo>("Video", VideoSchema);
