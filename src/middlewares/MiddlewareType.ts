import { Request, Response, NextFunction } from 'express';

export type MiddlewareType = (Request, Response, NextFunction)
    => void | Response<string, Record<string, string>>;