import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/summary', AnalyticsController.getSummary);
router.get('/categories', AnalyticsController.getCategories);
router.get('/monthly', AnalyticsController.getMonthly);

export default router;
