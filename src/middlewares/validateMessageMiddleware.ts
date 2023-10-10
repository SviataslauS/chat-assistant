import createValidationMiddleware from './createValidationMiddleware';

const ENV_CONF_SCHEMA_PATH = '../schemas/message.yaml';

const validateMessageMiddleware = createValidationMiddleware(ENV_CONF_SCHEMA_PATH);

export default validateMessageMiddleware;
