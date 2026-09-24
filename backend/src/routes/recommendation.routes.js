import { Router } from 'express';
import { RecommendationController } from '../controllers/recommendation.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/', RecommendationController.getRecommendations);

export default router;
