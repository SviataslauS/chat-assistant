import winston, { format, transports } from 'winston';
import { ConsoleFormatter } from 'winston-console-formatter';
import { config } from './config';

const logger = winston.createLogger({
  level: config.DEBUG === 'true' ? 'debug' : 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.timestamp(),
        format.simple(),
        new ConsoleFormatter()
      ),
    }),
  ],
});

export default logger;
