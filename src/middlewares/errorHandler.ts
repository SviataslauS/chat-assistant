import { MiddlewareType } from './MiddlewareType';
import logger from '../logger';

const errorHandler: MiddlewareType = (req, res, next) => {
    try {
        next();
    } catch (error) {
        logger.error(error.message);
        logger.error(error.stack);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export default errorHandler;