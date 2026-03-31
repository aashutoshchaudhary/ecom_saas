import { Kafka, Producer } from 'kafkajs';
import { config } from '../config';

let producer: Producer | null = null;

export async function connectKafka(): Promise<void> {
  try {
    const kafka = new Kafka({ clientId: config.serviceName, brokers: config.kafka.brokers });
    producer = kafka.producer();
    await producer.connect();
    console.log('Connected to Kafka');
  } catch (error) {
    console.error('Failed to connect to Kafka:', error);
  }
}

export async function publishEvent(topic: string, data: Record<string, unknown>): Promise<void> {
  if (!producer) return;
  await producer.send({
    topic,
    messages: [{ value: JSON.stringify({ event: topic, data, timestamp: new Date().toISOString(), service: config.serviceName }) }],
  });
}

export async function disconnectKafka(): Promise<void> {
  if (producer) await producer.disconnect();
}
