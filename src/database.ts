import { Sequelize } from 'sequelize';
import { envConfig } from './envConfig';

const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD } = envConfig;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: parseInt(DB_PORT),
  dialect: 'postgres',
  logging: false,
});

export const initDB = async (): Promise<void> => {
  await sequelize
    .authenticate()
    .then(() => {
      console.log('Database connection has been established successfully.');
    })
    .catch((err: Error) => {
      console.error('Unable to connect to the database:', err);
    });
  };

export default sequelize;
