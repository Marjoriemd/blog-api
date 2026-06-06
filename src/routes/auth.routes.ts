import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { login, register, getMe, changePassword } from '../controllers/auth.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { loginSchema, registerSchema, changePasswordSchema } from '../schemas/auth.schema';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { status: 429, message: 'Too many requests, please try again later' } },
});

router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/register', authLimiter, validate(registerSchema), register);
router.get('/me', requireAuth(false), getMe);
router.put('/change-password', requireAuth(true), validate(changePasswordSchema), changePassword);

export default router;
