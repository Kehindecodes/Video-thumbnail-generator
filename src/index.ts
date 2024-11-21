import express, { Request, Response } from 'express';
import amqp, { Connection, Channel, Message } from 'amqplib/callback_api';
import multer from 'multer';
import { uploadToS3 } from './config/aws';
import { Video } from './model/Video';
import { handleSingleUpload } from './routes/UploadController';

const app = express();

interface CustomError extends Error {
    status?: number;
}


// Multer configuration for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit
    },
    // fileFilter: (req, file, cb) => {
    //     if (file.mimetype.startsWith('video/')) {
    //         cb(null, true);
    //     } else {
    //         const error: CustomError = new Error();
    //         error.message = 'only video files are allowed';
    //         error.status = 400; 
    //         cb(error);
    //     }
    // }
});



app.get('/', (req: Request, res: Response) => {
    res.send('Hello, World!');
});


app.post('/video/upload', upload.single('video'), handleSingleUpload);

export default app;
