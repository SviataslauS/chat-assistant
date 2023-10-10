import jsYaml from 'js-yaml';
import fs from 'fs';
import path from 'path';
import Ajv, { type AnySchema} from "ajv"
import logger from './logger';

const FILE_ENCODING = 'utf8';

const ajv = new Ajv({ 
    allErrors: true,
    verbose: true,
    $comment: true,
 });

type ValidateFnType = ReturnType<typeof ajv.compile>;
export type ValidateJsonType = (yamlShemaPath: string) => ValidateFnType;
export const buildValidateFn: ValidateJsonType = (yamlShemaPath) => {
    const schemaFilePath = path.resolve(__dirname, yamlShemaPath);
    let schemaFile = "";
    try {
        schemaFile = fs.readFileSync(schemaFilePath, FILE_ENCODING);
    } catch (error) {
        logger.error("Read file sync error:", error);
    }
    const schema = jsYaml.load(schemaFile) as AnySchema;
    return ajv.compile(schema);
}

type ValidateData = (validate: ValidateFnType,jsonData: Record<string, unknown>) => { isValid: boolean | Promise<unknown>, errorsMessage?: string };
export const validateData: ValidateData = (validate, jsonData) => {
    const isValid = validate(jsonData);
    const errorsText = ajv.errorsText(validate.errors, { separator: ',\n' });
    const errorsMessage = `\n${errorsText}`;
    return { isValid, errorsMessage };
}
