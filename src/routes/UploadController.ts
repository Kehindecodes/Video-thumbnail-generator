import { Request, Response } from "express";
import { uploadToS3 } from "../config/aws";
import { Video, Status } from "../model/Video";
import { sendMessageToQueue } from "../workQueue/messageQueue";
import { v4 as uuidv4 } from 'uuid';

const allowedFormats = ['video/mp4', 'video/webm', 'video/ogg', 'video/mkv'];

export const handleSingleUpload = async (req: Request, res: Response) : Promise<any>  => {
    try {
        const uploadStartTime = new Date();
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        if (!allowedFormats.includes(req.file.mimetype)) {
            return res.status(400).json({ error: 'Invalid file format' });
        }

        const s3Location = await uploadToS3(req.file);
        const uploadEndTime = new Date();

        // Calculate upload duration in seconds
        const uploadDurationInSeconds = (uploadEndTime.getTime() - uploadStartTime.getTime()) / 1000;

        // Create video document in MongoDB
        const video = new Video({
            _id: uuidv4(),
            title: req.body.title || req.file.originalname,
            description: req.body.description || '',
            filePath: s3Location,
            size: req.file.size,
            format: req.file.mimetype,
            uploadTime: `${uploadDurationInSeconds.toFixed(2)} seconds`,
            status: Status.UPLOADED,
            processsingDetails: {
                startedAt: null,
                finishedAt: null
            },
            uploadedAt: uploadEndTime
        });

        console.log("Generated ID:", video._id);

        await video.save();

        sendMessageToQueue(video);

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