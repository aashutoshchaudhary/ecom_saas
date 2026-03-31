import amqplib from 'amqplib';
import { config } from '../config';

let connection: any = null;
let channel: any = null;
const EXCHANGE = 'siteforge.events';

export async function connectRabbitMQ(): Promise<void> {
  try {
    connection = await amqplib.connect(config.rabbitmq.url);
    channel = await connection.createChannel();
    await channel.assertExchange(EXCHANGE, 'topic', { durable: true });
    console.log('Connected to RabbitMQ');
  } catch (error) {
    console.error('Failed to connect to RabbitMQ:', error);
  }
}

export async function publishEvent(routingKey: string, data: Record<string, unknown>): Promise<void> {
  if (!channel) return;
  const message = Buffer.from(JSON.stringify({
    event: routingKey, data, timestamp: new Date().toISOString(), service: config.serviceName,
  }));
  channel.publish(EXCHANGE, routingKey, message, { persistent: true });
}

export async function closeRabbitMQ(): Promise<void> {
  if (channel) await channel.close();
  if (connection) await connection.close();
}
