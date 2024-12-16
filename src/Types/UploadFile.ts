import { Readable } from "stream";

export interface UploadFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    buffer: Buffer;
    size: number;
    destination: string;
    filename: string;
    path: string;
    stream: Readable;
  }