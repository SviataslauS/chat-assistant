import createValidationMiddleware from './createValidationMiddleware';
import { buildValidateSchema } from '../utils';

const validateSchema = buildValidateSchema('../schemas/message.yaml');
const validateMessageMiddleware = createValidationMiddleware(validateSchema);

export default validateMessageMiddleware;
