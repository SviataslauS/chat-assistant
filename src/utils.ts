import * as yup from 'yup';
import jsYaml from 'js-yaml';
import fs from 'fs';
import path from 'path';

const FILE_ENCODING = 'utf8';

const yupObjectShapeFn = yup.object().shape;
export type ValidateSchemaType = ReturnType<typeof yupObjectShapeFn>;

export function buildValidateSchema(yamlShemaPath: string): ValidateSchemaType {
    const schemaFilePath = path.resolve(__dirname, yamlShemaPath);
    const schemaFile = fs.readFileSync(schemaFilePath, FILE_ENCODING);
    const schema = jsYaml.load(schemaFile) as yup.ObjectShape;
    return yup.object().shape(schema);
}