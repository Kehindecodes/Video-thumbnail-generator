import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

// Configure the S3 client
const s3Client = new S3Client({
    region: "eu-north-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});
export const BUCKET_NAME = process.env.AWS_BUCKET_NAME!;

export const uploadToS3 = async (file: Express.Multer.File): Promise<string> => {
        const params = {
            Bucket: BUCKET_NAME,
            Key: `videos/${Date.now()}-${file.originalname}`,
            Body: file.buffer,
            ContentType: file.mimetype,
        };
    
        try {
            // Upload the file to S3
            const command = new PutObjectCommand(params);
            await s3Client.send(command);
            
            const fileUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;
            return fileUrl;
        } catch (error) {
            throw new Error(`Error uploading file to S3: ${error}`);
        }
    }

