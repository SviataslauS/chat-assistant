import winston, { format, transports } from 'winston';
import envConfig from './envConfig';

const logger = winston.createLogger({
  level: envConfig?.DEBUG === 'true' ? 'debug' : 'info',
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
      ),
    }),
  ],
});

export default logger;
