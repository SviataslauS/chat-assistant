import { Request, Response, NextFunction } from 'express';
import * as yup from 'yup';

const yuuShape = yup.object().shape;
type ValidateSchemaType = ReturnType<typeof yuuShape>;

const createValidationMiddleware = (validateSchema: ValidateSchemaType) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    validateSchema.validate(req.body, { abortEarly: false });
    next();
  } catch (error) {
    return res.status(400).json({ error: error.errors.join(', ') });
  }
};

export default createValidationMiddleware;
