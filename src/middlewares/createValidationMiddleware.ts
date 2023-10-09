import { type ValidationError } from 'yup';
import { type MiddlewareType } from './MiddlewareType';
import { type ValidateSchemaType } from '../utils';

type CreateMiddleware = (schema: ValidateSchemaType) =>  MiddlewareType;
const createValidationMiddleware: CreateMiddleware = (validateSchema) => (req,res,next) => {
  try {
    validateSchema.validateSync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    const message = (error as ValidationError).errors.join(', ');
    return res.status(400).json({ error: message });
  }
};

export default createValidationMiddleware;
