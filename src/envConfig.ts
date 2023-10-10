import { buildValidateFn, validateData } from './utils';

const ENV_CONF_SCHEMA_PATH = 'schemas/envConfig.yaml';

const validateFn = buildValidateFn(ENV_CONF_SCHEMA_PATH);

export const loadConfig = (): Record<string, string> => {
  const configValues: Record<string, string> = {
    PORT: process.env.PORT || '',
    DB_HOST: process.env.DB_HOST || '',
    DB_PORT: process.env.DB_PORT || '',
    DB_NAME: process.env.DB_NAME || '',
    DB_USER: process.env.DB_USER || '',
    DB_PASSWORD: process.env.DB_PASSWORD || '',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
    DEBUG: process.env.DEBUG || 'false',
    CHAT_SERVICE_API: process.env.CHAT_SERVICE_API || '',
  };

  const { isValid, errorsMessage } = validateData(validateFn, configValues);
  if(!isValid) {
    throw Error(errorsMessage)
  }

  return configValues;
};

const envConfig = loadConfig();

export default envConfig;
