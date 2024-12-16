import { 
    S3Client, 
    PutObjectCommand, 
    GetObjectCommand, 
    PutBucketPolicyCommand 
} from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import { UploadFile } from '../Types/UploadFile';

dotenv.config();

const AWS_REGION = "eu-north-1";

// Configure the S3 client
const s3Client = new S3Client({
    region: AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});
export const BUCKET_NAME = process.env.AWS_BUCKET_NAME!;

// set bucket public access policy
async function configureBucketPublicAccess() {
    const bucketPolicy = {
        Version: '2012-10-17',
        Statement: [
            {
                Sid: 'PublicReadGetObject',
                Effect: 'Allow',
                Principal: '*',
                Action: 's3:GetObject',
                Resource: `arn:aws:s3:::${BUCKET_NAME}/*`
            }
        ]
    };

    try {
        const command = new PutBucketPolicyCommand({
            Bucket: BUCKET_NAME,
            Policy: JSON.stringify(bucketPolicy)
        });

        await s3Client.send(command);
        console.log(`Bucket ${BUCKET_NAME} public access policy set successfully`);
    } catch (error) {
        console.error('Error setting bucket public access policy:', error);
        throw new Error(`Failed to configure bucket policy: ${error}`);
    }
}

export const uploadToS3 = async (file:UploadFile): Promise<string> => {
    // Check if bucket policy needs to be set (you can add a flag or check)
    await configureBucketPublicAccess();

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
        
        const fileUrl = `https://${BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${params.Key}`;
        return fileUrl;
    } catch (error) {
        throw new Error(`Error uploading file to S3: ${error}`);
    }
}
