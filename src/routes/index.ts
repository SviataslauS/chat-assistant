import { Router } from 'express';
import { handleMessage } from '../routeHandlers/handleMessage';
import validateMessageMiddleware from '../middlewares/validateMessageMiddleware';

const router = Router();

router.post('/message', validateMessageMiddleware, handleMessage);

export default router;
