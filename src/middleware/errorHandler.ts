import { Request, Response, NextFunction } from 'express';
import logger from '../logger';

export default function errorHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
    try {
        next();
    } catch (error) {
        logger.error(error.message);
        logger.error(error.stack);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
