// eslint-disable-next-line @typescript-eslint/no-var-requires
const dotenv = require('dotenv');
dotenv.config({ path: '.env.test' });

module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
};
  