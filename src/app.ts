/* eslint-disable import/first */
import dotenv from 'dotenv';
dotenv.config();
subscribeToUncaughtErrors();

import express, { type Application } from 'express';
import bodyParser from 'body-parser';
import envConfig from './envConfig';
import logger from './logger';
import { initDB } from './database';
import router from './routes';
import errorHandler from './middlewares/errorHandler';
import requestLogger from './middlewares/requestLogger';

const DEFAULT_PORT = '3000';

function uncaughtErrorListener(errorName: string): NodeJS.UncaughtExceptionListener {
  return (error: Error): void => {
    // eslint-disable-next-line no-console
    console.error(errorName, error.message);
    process.exit(1);
  };
}

function subscribeToUncaughtErrors(): void {
  process.on('uncaughtException', uncaughtErrorListener('Uncaught Exception:'));
  process.on('unhandledRejection', uncaughtErrorListener('Unhandled Rejection:'));
}

const app: Application = express();
app.use(requestLogger);
app.use(bodyParser.json());
app.use(errorHandler);
app.use('/', router);

const startServer  = async (): Promise<void> => {
  await initDB();

  const portStr: string = envConfig.PORT || DEFAULT_PORT;
  const port: number = parseInt(portStr);
  app.listen(port, (): void => {
    logger.info(`Server is running on port ${port}`);
  });
};

startServer().catch((error) => {
  logger.error('Error starting the server:', error);
});
