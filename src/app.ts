import express, { Application } from 'express';
import bodyParser from 'body-parser';
import router from './routes';
import errorHandler from './middleware/errorHandler';
import requestLogger from './middleware/requestLogger';
import logger from './logger';
import { config } from './config';
import { initDB } from './database';

const DEFAULT_PORT = '3000';

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (error: Error) => {
  logger.error('Unhandled Rejection:', error.message);
  process.exit(1);
});

const app: Application = express();
app.use(requestLogger);
app.use(bodyParser.json());
app.use(errorHandler);
app.use('/', router);

initDB();

const PORT: number = parseInt(config.PORT || DEFAULT_PORT);
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

