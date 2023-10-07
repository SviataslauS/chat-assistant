import { MiddlewareType } from './MiddlewareType';
import * as yup from 'yup';

const yupObjectShape = yup.object().shape;
type ValidateSchemaType = ReturnType<typeof yupObjectShape>;
type CreateMiddleware =
  (ValidateSchemaType) =>  MiddlewareType;

const createValidationMiddleware: CreateMiddleware = (validateSchema) => (req,res,next) => {
  try {
    validateSchema.validate(req.body, { abortEarly: false });
    next();
  } catch (error) {
    return res.status(400).json({ error: error.errors.join(', ') });
  }
};

export default createValidationMiddleware;
