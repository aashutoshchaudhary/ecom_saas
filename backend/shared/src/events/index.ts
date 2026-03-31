import { Kafka, Producer, Consumer, EachMessagePayload, logLevel } from 'kafkajs';
import { generateId } from '../utils';
import { logger } from '../middleware';
import type { EventPayload } from '../types';

const KAFKA_BROKERS = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');
const SERVICE_NAME = process.env.SERVICE_NAME || 'unknown';

let kafkaInstance: Kafka | null = null;

function getKafka(): Kafka {
  if (!kafkaInstance) {
    kafkaInstance = new Kafka({
      clientId: SERVICE_NAME,
      brokers: KAFKA_BROKERS,
      logLevel: logLevel.WARN,
      retry: {
        initialRetryTime: 300,
        retries: 10,
      },
    });
  }
  return kafkaInstance;
}

// ─── Producer ─────────────────────────────────────────────

let producerInstance: Producer | null = null;

export class EventProducer {
  static async getInstance(): Promise<Producer> {
    if (!producerInstance) {
      const kafka = getKafka();
      producerInstance = kafka.producer({
        idempotent: true,
        maxInFlightRequests: 5,
      });
      await producerInstance.connect();
      logger.info('Kafka producer connected');
    }
    return producerInstance;
  }

  static async publish<T>(
    topic: string,
    eventType: string,
    data: T,
    tenantId: string,
    userId?: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    const producer = await EventProducer.getInstance();

    const payload: EventPayload<T> = {
      eventId: generateId(),
      eventType,
      timestamp: new Date().toISOString(),
      tenantId,
      userId,
      data,
      metadata,
    };

    await producer.send({
      topic,
      messages: [
        {
          key: tenantId,
          value: JSON.stringify(payload),
          headers: {
            eventType,
            eventId: payload.eventId,
            source: SERVICE_NAME,
            timestamp: payload.timestamp,
          },
        },
      ],
    });

    logger.info('Event published', {
      topic,
      eventType,
      eventId: payload.eventId,
      tenantId,
    });
  }

  static async disconnect(): Promise<void> {
    if (producerInstance) {
      await producerInstance.disconnect();
      producerInstance = null;
    }
  }
}

// ─── Consumer ─────────────────────────────────────────────

type EventHandler<T = unknown> = (payload: EventPayload<T>) => Promise<void>;

export class EventConsumer {
  private consumer: Consumer;
  private handlers: Map<string, EventHandler> = new Map();

  constructor(groupId?: string) {
    const kafka = getKafka();
    this.consumer = kafka.consumer({
      groupId: groupId || `${SERVICE_NAME}-group`,
      sessionTimeout: 30000,
      heartbeatInterval: 3000,
    });
  }

  on<T>(eventType: string, handler: EventHandler<T>): void {
    this.handlers.set(eventType, handler as EventHandler);
  }

  async subscribe(topics: string[]): Promise<void> {
    await this.consumer.connect();

    for (const topic of topics) {
      await this.consumer.subscribe({ topic, fromBeginning: false });
    }

    await this.consumer.run({
      eachMessage: async (messagePayload: EachMessagePayload) => {
        const { topic, message } = messagePayload;

        try {
          if (!message.value) return;

          const payload: EventPayload = JSON.parse(message.value.toString());
          const handler = this.handlers.get(payload.eventType);

          if (handler) {
            logger.info('Processing event', {
              topic,
              eventType: payload.eventType,
              eventId: payload.eventId,
            });

            await handler(payload);

            logger.info('Event processed', {
              topic,
              eventType: payload.eventType,
              eventId: payload.eventId,
            });
          }
        } catch (error) {
          logger.error('Event processing failed', {
            topic,
            error: (error as Error).message,
            message: message.value?.toString(),
          });

          // Publish to dead letter topic
          try {
            await EventProducer.publish(
              `${topic}.dlq`,
              'dead_letter',
              {
                originalMessage: message.value?.toString(),
                error: (error as Error).message,
                stack: (error as Error).stack,
              },
              'system'
            );
          } catch (dlqError) {
            logger.error('Failed to publish to DLQ', { error: (dlqError as Error).message });
          }
        }
      },
    });

    logger.info('Kafka consumer started', { topics });
  }

  async disconnect(): Promise<void> {
    await this.consumer.disconnect();
  }
}
