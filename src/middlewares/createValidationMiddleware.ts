import { type MiddlewareType } from './MiddlewareType';
import { buildValidateFn, validateData } from '../utils';

type CreateMiddleware = (yamlSchemaPath: string) =>  MiddlewareType;
const createValidationMiddleware: CreateMiddleware = (yamlSchemaPath) => {
  const validateFn = buildValidateFn(yamlSchemaPath);
    return (req,res,next) => {
      const { isValid, errorsMessage } = validateData(validateFn, req.body);
      if(isValid) {
        next();
      } else {
        return res.status(400).json({ error: errorsMessage });
      }
  }
};

export default createValidationMiddleware;
