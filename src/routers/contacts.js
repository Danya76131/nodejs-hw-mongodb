import { Router } from 'express';
import {
  createContactController,
  deleteContactController,
  getContactByIdController,
  getContactsController,
  updateContactController,
} from '../controllers/contacts.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateBody.js';
import {
  createContactSchema,
  updateContactSchema,
} from '../validation/contacts.js';
import { isValidId } from '../middlewares/isValidId.js';
import { authenticate } from '../middlewares/authenticate.js';
import { upload } from '../middlewares/upload.js';

const router = Router();
router.get('/', authenticate, ctrlWrapper(getContactsController));
router.get(
  '/:contactId',
  authenticate,
  isValidId,
  ctrlWrapper(getContactByIdController),
);

router.patch(
  '/:contactId',
  authenticate,
  isValidId,
  validateBody(updateContactSchema),
  ctrlWrapper(updateContactController),
);
router.delete(
  '/:contactId',
  authenticate,
  isValidId,
  ctrlWrapper(deleteContactController),
);

router.post(
  '/',
  authenticate,
  upload.single('photo'),
  validateBody(createContactSchema),
  ctrlWrapper(createContactController),
);
export default router;
