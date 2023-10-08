import { type Request, type Response, type NextFunction } from 'express';

export type MiddlewareType =
    (req: Request, res: Response, next: NextFunction) => void;