import { Router } from 'express';
import { validateBody } from '../middlewares/validateBody.js';
import {
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  sendResetEmailSchema,
} from '../validation/auth.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import {
  loginController,
  logoutController,
  refreshController,
  registerController,
  resetPasswordController,
  sendResetEmailController,
} from '../controllers/auth.js';

const router = Router();
router.post(
  '/register',
  validateBody(registerSchema),
  ctrlWrapper(registerController),
);
router.post('/login', validateBody(loginSchema), ctrlWrapper(loginController));
router.post('/refresh', ctrlWrapper(refreshController));
router.post('/logout', ctrlWrapper(logoutController));
router.post(
  '/send-reset-email',
  validateBody(sendResetEmailSchema),
  ctrlWrapper(sendResetEmailController),
);
router.post(
  '/reset-pwd',
  validateBody(resetPasswordSchema),
  ctrlWrapper(resetPasswordController),
);

export default router;
