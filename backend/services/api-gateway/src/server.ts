import app from './app';
import { config } from './config';
import { RedisClient } from '@siteforge/shared';
import { logger } from './middleware/request-logger';

const server = app.listen(config.port, () => {
  logger.info(`API Gateway running on port ${config.port}`, {
    environment: config.nodeEnv,
    port: config.port,
  });
});

// Graceful shutdown
const shutdown = async (signal: string) => {
  logger.info(`${signal} received, starting graceful shutdown`);

  server.close(async () => {
    logger.info('HTTP server closed');

    try {
      await RedisClient.disconnect();
      logger.info('Redis disconnected');
    } catch (error) {
      logger.error('Error during shutdown', { error });
    }

    process.exit(0);
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30_000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', { reason });
});
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { error: error.message, stack: error.stack });
  process.exit(1);
});
