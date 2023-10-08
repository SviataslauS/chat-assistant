import { Router } from 'express';
import asyncHandler from 'express-async-handler'
import { handleMessage } from '../routeHandlers/handleMessage';
import validateMessageMiddleware from '../middlewares/validateMessageMiddleware';

const router = Router();

router.post('/message', validateMessageMiddleware, asyncHandler(handleMessage));

export default router;
