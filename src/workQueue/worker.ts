#!/usr/bin/env node

import amqp, { Channel, Connection, Message } from 'amqplib/callback_api';

const queue = 'generate_thumbnails';

function receiveMessages() {
    amqp.connect('amqp://localhost:5672', (error, connection: Connection) => {
        if (error) {
            throw error;
          }
         connection.createChannel((channelError, channel: Channel) => {
            if (channelError) {
                throw channelError;
              }

              channel.assertQueue(queue, { durable: true });
              channel.prefetch(1);
              
              console.log('Waiting for messages...');
              
              channel.consume(queue, (msg: Message | null) => {
                if (msg === null) {
                  return;
                }
                setTimeout(function() {
                    console.log(`Received: ${msg.content.toString()}`);
                    channel.ack(msg);
                  }, 1000);
              }), { noAck: false };
         });
    });
}

receiveMessages();