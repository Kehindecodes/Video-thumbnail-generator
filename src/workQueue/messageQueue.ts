import amqp, { Connection, Channel } from 'amqplib/callback_api';

const queue = 'generate_thumbnails';

export function sendMessageToQueue(message: string): void {
    amqp.connect('amqp://localhost:5672', (error, connection: Connection) => {
        if (error) {
            throw error;
        }
        connection.createChannel((channelError, channel: Channel) => {
            if (channelError) {
                throw channelError;
            }
            channel.assertQueue(queue, { durable: true });
            channel.sendToQueue(queue, Buffer.from(message), { persistent: true });

            setTimeout(() => {
                connection.close();
            }, 500);
        });
    });
}
