import { Request, Response, NextFunction } from 'express'
import logger from '../logger';

export default function requestLogger (
  request: Request,
  response: Response,
  next: NextFunction
) {
  logger.info(`${request.method} url:: ${request.url}`);
  next();
}
