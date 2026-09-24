import { Router } from 'express';
import { ActivityController } from '../controllers/activity.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { validate, activitySchema, batchActivitySchema } from '../middleware/validate.middleware.js';

const router = Router();

router.use(authenticateToken);

router.post('/', validate(activitySchema), ActivityController.create);
router.post('/batch', validate(batchActivitySchema), ActivityController.batch);
router.post('/preview', ActivityController.preview);
router.get('/', ActivityController.getAll);
router.get('/:id', ActivityController.getById);
router.put('/:id', ActivityController.update);
router.delete('/:id', ActivityController.delete);

export default router;
