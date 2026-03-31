import app from './app';
import { logger, RedisClient, EventProducer } from '@siteforge/shared';

const PORT = parseInt(process.env.PORT || '3013', 10);

const server = app.listen(PORT, () => {
  logger.info(`pricing-service running on port ${PORT}`);
});

const shutdown = async (signal: string) => {
  logger.info(`${signal} received, shutting down pricing-service`);
  server.close(async () => {
    await RedisClient.disconnect();
    await EventProducer.disconnect();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 30_000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (reason) => logger.error('Unhandled rejection', { reason }));
