import { Router } from 'express';
import { PredictionController } from '../controllers/prediction.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticateToken);

router.post('/', PredictionController.predict);
router.get('/profile', PredictionController.getProfile);

export default router;
