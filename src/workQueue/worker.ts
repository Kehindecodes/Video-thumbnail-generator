#!/usr/bin/env node

import amqp, { Channel, Connection, Message } from "amqplib/callback_api";
import { IVideo, Status, Video } from "../model/Video";
import { generateThumbnail } from "../helper-fns/generateThumbnail";
import { mongoConnect } from "../config/DB-config";
import path from 'path';

const queue = "generate_thumbnails";

async function initializeWorker() {
  try {
    await mongoConnect();

    amqp.connect("amqp://localhost:5672", (error, connection: Connection) => {
      if (error) {
        console.error("AMQP Connection Error:", error);
        throw error;
      }
      connection.createChannel((channelError, channel: Channel) => {
        if (channelError) {
          console.error("Channel Creation Error:", channelError);
          throw channelError;
        }

        channel.assertQueue(queue, { durable: true });
        channel.prefetch(1);

        console.log("Waiting for messages...");

        channel.consume(queue, async (msg: Message | null) => {
          if (msg === null) {
            return;
          }

          let videoData: IVideo | null = null;
          const processingStartTime = Date.now();

          try {
            const messageContent = msg.content.toString();
            console.log(`Processing message: ${messageContent}`);

            videoData = JSON.parse(messageContent);

            if (!videoData || !videoData._id) {
              throw new Error("Invalid video data received");
            }

            videoData.status = Status.PROCESSING;
            videoData.processsingDetails.startedAt = new Date();

           const thumbnailPath = await generateThumbnail(
             videoData.filePath,
             path.join(process.cwd(), 'thumbnails', `${videoData.title}_thumbnail.png`)
           );

            // Acknowledge message
            channel.ack(msg);

            videoData.status = Status.GENERATED;
            videoData.thumbnailPath = thumbnailPath;
            videoData.processsingDetails.finishedAt = new Date();

            // Calculate processing time
            const processingEndTime = Date.now();
            const processingDuration = processingEndTime - processingStartTime;
            const processingDurationInSeconds = processingDuration / 1000;

            await Video.findByIdAndUpdate(videoData._id, {
              ...videoData,
              processingTime: `${processingDurationInSeconds.toFixed(2)} seconds`
            }, {
              timeout: 30000,
              retryWrites: true
            });

            console.log(`Video processed in ${processingDuration}ms`);
          } catch (processingError) {
            console.error("Error processing video:", processingError);

            // Calculate processing time even for failed tasks
            const processingEndTime = Date.now();
            const processingDuration = processingEndTime - processingStartTime;
            const processingDurationInSeconds = processingDuration / 1000;

            if (videoData && videoData._id) {
              await Video.findByIdAndUpdate(videoData._id, {
                status: Status.FAILED,
                processingTime: `${processingDurationInSeconds.toFixed(2)} seconds`,
                processsingDetails: {
                  ...videoData.processsingDetails,
                  error: processingError instanceof Error ? processingError.toString() : 'Unknown error'
                }
              });
            }
          }
        }, { noAck: false });
      });
    });
  } catch (initError) {
    console.error("Initialization Error:", initError);
    process.exit(1);
  }
}

initializeWorker();
