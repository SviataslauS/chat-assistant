import { type MiddlewareType } from './MiddlewareType';
import logger from '../logger';

const errorHandler: MiddlewareType = (req, res, next) => {
    try {
        next();
    } catch (error) {
        logger.error((error as Error).message);
        logger.error((error as Error).stack);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export default errorHandler;