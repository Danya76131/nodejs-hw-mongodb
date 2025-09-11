import express from 'express';
import cors from 'cors';
import pino from 'pino-http';
import contactRouter from './routers/contacts.js';
import authRouter from './routers/auth.js';
import errorHandler from './middlewares/errorHandler.js';
import notFoundHandler from './middlewares/notFoundHandler.js';
import cookieParser from 'cookie-parser';

export const setupServer = () => {
  const app = express();

  app.use(cors());
  app.use(pino());

  app.use(express.json()); //  щоб читати JSON з body
  app.use(cookieParser());

  app.use('/auth', authRouter);
  app.use('/contacts', contactRouter);

  //  якщо маршрут не знайдений
  app.use(notFoundHandler);

  //  глобальний обробник помилок
  app.use(errorHandler);

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
  });
};
