import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import pino from 'pino-http';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';

import YAML from 'yaml';
import swaggerUi from 'swagger-ui-express';

import contactRouter from './routers/contacts.js';
import authRouter from './routers/auth.js';
import errorHandler from './middlewares/errorHandler.js';
import notFoundHandler from './middlewares/notFoundHandler.js';

export const setupServer = () => {
  const app = express();

  app.use(cors());
  app.use(pino());
  app.use(express.json());
  app.use(cookieParser());

  // Swagger через fs + yaml
  const swaggerFilePath = path.resolve('docs/openapi.yaml');

  if (!fs.existsSync(swaggerFilePath)) {
    console.error(' Swagger file not found at:', swaggerFilePath);
    process.exit(1);
  }

  const swaggerFile = fs.readFileSync(swaggerFilePath, 'utf8');
  const swaggerDocument = YAML.parse(swaggerFile);

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  // Роутери
  app.use('/auth', authRouter);
  app.use('/contacts', contactRouter);

  // Middleware для 404
  app.use(notFoundHandler);

  // Глобальний обробник помилок
  app.use(errorHandler);

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
    console.log(`📖 Swagger UI available at http://localhost:${PORT}/api-docs`);
  });
};
