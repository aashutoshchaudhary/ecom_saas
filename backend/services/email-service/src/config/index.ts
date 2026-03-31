import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3020', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  database: { url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/email_service_db' },
  redis: { host: process.env.REDIS_HOST || 'localhost', port: parseInt(process.env.REDIS_PORT || '6379', 10) },
  kafka: { brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(',') },
  jwt: { secret: process.env.JWT_SECRET || 'dev-jwt-secret' },
  rabbitmq: { url: process.env.RABBITMQ_URL || 'amqp://localhost:5672' },
  serviceName: 'email-service',
  smtp: {
    host: process.env.SMTP_HOST || 'localhost',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    secure: process.env.SMTP_SECURE === 'true',
    from: process.env.SMTP_FROM || 'noreply@siteforge.io',
  },
  aws: {
    sesFromEmail: process.env.AWS_SES_FROM_EMAIL || 'noreply@siteforge.io',
  },
};
