import amqp, { Connection, Channel } from 'amqplib/callback_api';
import { IVideo} from '../model/Video';
const queue = 'generate_thumbnails';

export function sendMessageToQueue(message: IVideo): void {
    amqp.connect('amqp://localhost:5672', (error, connection: Connection) => {
        if (error) {
            throw error;
        }
        connection.createChannel( (channelError, channel: Channel) => {
            if (channelError) {
                throw channelError;
            }
            channel.assertQueue(queue, { durable: true });
            channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), { persistent: true });

            console.log(" [x] Sent %s", message);

            setTimeout(() => {
                connection.close();
            }, 500);
        });
    });
}
