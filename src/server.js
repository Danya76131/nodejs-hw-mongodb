import express from 'express';
import cors from 'cors';
import pino from 'pino-http';
import {
  getContactByIdController,
  getContactsController,
} from './controllers/contact.js';

export const setupServer = () => {
  const app = express();

  app.use(cors());
  app.use(pino());

  app.get('/contacts', getContactsController);
  app.get('/contacts/:contactId', getContactByIdController);

  app.use((req, res) => {
    res.status(404).json({ message: 'Non found' });
  });

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
  });
};
