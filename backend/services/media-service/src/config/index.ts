import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3025', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  database: { url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/media_service_db' },
  redis: { host: process.env.REDIS_HOST || 'localhost', port: parseInt(process.env.REDIS_PORT || '6379', 10) },
  kafka: { brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(',') },
  jwt: { secret: process.env.JWT_SECRET || 'dev-jwt-secret' },
  rabbitmq: { url: process.env.RABBITMQ_URL || 'amqp://localhost:5672' },
  serviceName: 'media-service',
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
  s3: {
    bucket: process.env.S3_BUCKET || 'siteforge-media',
  },
  cloudfront: {
    distributionUrl: process.env.CLOUDFRONT_URL || '',
  },
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10),
    allowedMimeTypes: (process.env.ALLOWED_MIME_TYPES || 'image/jpeg,image/png,image/gif,image/webp,image/svg+xml,application/pdf,video/mp4').split(','),
  },
};
