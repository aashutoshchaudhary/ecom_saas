import amqplib from 'amqplib';
import { config } from '../config';

let connection: any = null;
let channel: any = null;
const EXCHANGE = 'siteforge.events';
const QUEUE = 'reporting-service.events';

export async function startConsumers(): Promise<void> {
  try {
    connection = await amqplib.connect(config.rabbitmq.url);
    channel = await connection.createChannel();
    await channel.assertExchange(EXCHANGE, 'topic', { durable: true });
    await channel.assertQueue(QUEUE, { durable: true });

    channel.consume(QUEUE, async (msg: any) => {
      if (!msg) return;
      try {
        const event = JSON.parse(msg.content.toString());
        console.log('Received event:', event.event);
        channel!.ack(msg);
      } catch (error) {
        console.error('Error processing event:', error);
        channel!.nack(msg, false, false);
      }
    });
    console.log('Reporting service consumers started');
  } catch (error) {
    console.error('Failed to start consumers:', error);
  }
}
