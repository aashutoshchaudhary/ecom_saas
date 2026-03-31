import { Worker, Queue } from 'bullmq';
import IORedis from 'ioredis';
import { config } from '../config';
import { emailService } from '../services/email.service';

const connection = new IORedis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  maxRetriesPerRequest: null,
});

export const emailQueue = new Queue('email-queue', { connection });

export function startEmailWorker(): void {
  const worker = new Worker(
    'email-queue',
    async (job) => {
      const { type, data } = job.data;

      switch (type) {
        case 'send':
          await emailService.sendEmail(data);
          break;
        case 'send-bulk':
          await emailService.sendBulkEmail(data);
          break;
        default:
          console.warn(`Unknown email job type: ${type}`);
      }
    },
    {
      connection,
      concurrency: 5,
      limiter: {
        max: 50,
        duration: 1000,
      },
    },
  );

  worker.on('completed', (job) => {
    console.log(`Email job ${job.id} completed`);
  });

  worker.on('failed', (job, error) => {
    console.error(`Email job ${job?.id} failed:`, error);
  });

  console.log('Email worker started');
}
