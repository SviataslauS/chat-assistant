import { type MiddlewareType } from './MiddlewareType';
import * as yup from 'yup';


const yupObjectShape = yup.object().shape;
type ValidateSchemaType = ReturnType<typeof yupObjectShape>;
type CreateMiddleware = (schema: ValidateSchemaType) =>  MiddlewareType;

const createValidationMiddleware: CreateMiddleware = (validateSchema) => (req,res,next) => {
  try {
    validateSchema.validateSync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    const message = (error as yup.ValidationError).errors.join(', ');
    return res.status(400).json({ error: message });
  }
};

export default createValidationMiddleware;
