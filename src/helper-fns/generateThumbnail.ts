import ffmpeg from "fluent-ffmpeg";
import { uploadToS3 } from "../config/aws";
import dotenv from "dotenv";
import fs from 'fs';
import { Readable } from 'stream';
import { UploadFile } from "../Types/UploadFile";
import path from 'path';
import os from 'os';
dotenv.config();



export const generateThumbnail = (
  videoPath: string,
  outputPath: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const tempThumbnailPath = path.join(os.tmpdir(), `${path.basename(videoPath)}_thumbnail.png`);

    // Ensure the temp directory exists
    fs.mkdirSync(path.dirname(tempThumbnailPath), { recursive: true });

    ffmpeg(videoPath)
      .on("start", (commandLine) => {
        console.log("FFmpeg processing started:", commandLine);
      })
      .on("filenames", (filenames) => {
        console.log(`Generated thumbnails: ${filenames.join(", ")}`);
      })
      .on("end", async () => {
        console.log("Thumbnail generation completed successfully!");

        try {
          // Read the thumbnail file
          const thumbnailBuffer = fs.readFileSync(tempThumbnailPath);

          const thumbnailFile: UploadFile = {
            fieldname: 'thumbnail',
            originalname: path.basename(tempThumbnailPath),
            encoding: '7bit',
            mimetype: 'image/png',
            buffer: thumbnailBuffer,
            size: thumbnailBuffer.length,
            destination: path.dirname(tempThumbnailPath),
            filename: path.basename(tempThumbnailPath),
            path: tempThumbnailPath,
            stream: fs.createReadStream(tempThumbnailPath)
          };

          // Upload directly to S3
          const thumbnailUrl = await uploadToS3(thumbnailFile);

          // Clean up temporary file
          fs.unlinkSync(tempThumbnailPath);

          resolve(thumbnailUrl);
        } catch (error) {
          console.error("Error uploading thumbnail:", error);
          reject(error);
        }
      })
      .on("error", (err) => {
        console.error("Error during thumbnail generation:", err.message);
        reject(err);
      })
      .screenshots({
        count: 1,
        timestamps: ["00:00:01"],
        size: "320x240",
        filename: path.basename(tempThumbnailPath),
        folder: path.dirname(tempThumbnailPath)
      });
  });
};
