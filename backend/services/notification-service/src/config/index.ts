import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3024', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  database: { url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/notification_service_db' },
  redis: { host: process.env.REDIS_HOST || 'localhost', port: parseInt(process.env.REDIS_PORT || '6379', 10) },
  kafka: { brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','), groupId: 'notification-service-group' },
  jwt: { secret: process.env.JWT_SECRET || 'dev-jwt-secret' },
  rabbitmq: { url: process.env.RABBITMQ_URL || 'amqp://localhost:5672' },
  serviceName: 'notification-service',
  vapid: {
    subject: process.env.VAPID_SUBJECT || 'mailto:admin@siteforge.io',
    publicKey: process.env.VAPID_PUBLIC_KEY || '',
    privateKey: process.env.VAPID_PRIVATE_KEY || '',
  },
  whatsapp: {
    apiUrl: process.env.WHATSAPP_API_URL || '',
    token: process.env.WHATSAPP_TOKEN || '',
  },
};
