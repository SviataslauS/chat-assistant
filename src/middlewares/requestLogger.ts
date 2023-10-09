import { type MiddlewareType } from './MiddlewareType';
import logger from '../logger';

const requestLogger: MiddlewareType = (req, res, next) => {
  logger.info(`${req.method} url:: ${req.url}`);
  next();
}
export default requestLogger;