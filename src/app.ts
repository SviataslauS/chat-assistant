import express, { type Application } from 'express';
import bodyParser from 'body-parser';
import router from './routes';
import errorHandler from './middlewares/errorHandler';
import requestLogger from './middlewares/requestLogger';
import logger from './logger';
import { config } from './config';
import { initDB } from './database';

const DEFAULT_PORT = '3000';

process.on('uncaughtException', (error: Error): void => {
  logger.error('Uncaught Exception:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (error: Error): void => {
  logger.error('Unhandled Rejection:', error.message);
  process.exit(1);
});

const app: Application = express();
app.use(requestLogger);
app.use(bodyParser.json());
app.use(errorHandler);
app.use('/', router);

const startServer  = async (): Promise<void> => {
  await initDB();

  const portStr: string = config.PORT?.length > 0 ? config.PORT : DEFAULT_PORT;
  const port: number = parseInt(portStr);
  app.listen(port, (): void => {
    logger.info(`Server is running on port ${port}`);
  });
};

startServer().catch((error) => {
  logger.error('Error starting the server:', error);
});

