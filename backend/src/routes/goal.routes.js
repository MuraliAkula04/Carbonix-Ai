import { Router } from 'express';
import { GoalController } from '../controllers/goal.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { validate, goalSchema } from '../middleware/validate.middleware.js';

const router = Router();

router.use(authenticateToken);

router.post('/', validate(goalSchema), GoalController.create);
router.get('/', GoalController.getAll);
router.put('/:id', GoalController.update);
router.delete('/:id', GoalController.delete);

export default router;
