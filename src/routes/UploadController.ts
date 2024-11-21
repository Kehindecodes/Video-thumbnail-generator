import e, { Request, Response } from "express";
import { uploadToS3 } from "../config/aws";
import { Video } from "../model/Video";
import { sendMessageToQueue } from "../workQueue/messageQueue";


 const allowedFormats = ['video/mp4', 'video/webm', 'video/ogg', 'video/mkv'];
export const handleSingleUpload = async (req: Request, res: Response) : Promise<any>  => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        if (!allowedFormats.includes(req.file.mimetype)) {
            return res.status(400).json({ error: 'Invalid file format' });
        }

        const s3Location = await uploadToS3(req.file);

        // Create video document in MongoDB
        const video = new Video({
            title: req.body.title || req.file.originalname,
            description: req.body.description || '',
            filePath: s3Location,
            size: req.file.size,
            format: req.file.mimetype,
            uploadTime: new Date(),
            status: 'UPLOADED',
            processsingDetails: {},
        });

        await video.save();

        // Send message to queue for processing
        sendMessageToQueue(JSON.stringify({ videoId: video.id }));

        res.status(201).json({
            message: 'Video uploaded successfully',
            video: {
                id: video.id,
                title: video.title,
                filePath: video.filePath,
                status: video.status
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Error uploading video' });
    }
};