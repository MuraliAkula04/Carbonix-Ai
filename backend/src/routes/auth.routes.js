import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { validate, registerSchema, loginSchema } from '../middleware/validate.middleware.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login', validate(loginSchema), AuthController.login);
router.get('/me', authenticateToken, AuthController.me);

export default router;
