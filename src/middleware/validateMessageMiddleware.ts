import { Request, Response, NextFunction } from 'express';
import * as yup from 'yup';
import { load } from 'js-yaml-loader';
import createValidationMiddleware from './createValidationMiddleware';

const schema = load('../schemas/message.yaml');
const validateSchema = yup.object().shape(schema);
const validateMessageMiddleware = createValidationMiddleware(validateSchema);

export default validateMessageMiddleware;
