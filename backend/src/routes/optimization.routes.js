import { Router } from 'express';
import { OptimizationController } from '../controllers/optimization.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/scenarios', OptimizationController.getScenarios);

export default router;
