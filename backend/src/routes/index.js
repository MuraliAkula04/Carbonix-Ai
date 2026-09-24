import { Router } from 'express';
import authRoutes from './auth.routes.js';
import activityRoutes from './activity.routes.js';
import analyticsRoutes from './analytics.routes.js';
import predictionRoutes from './prediction.routes.js';
import optimizationRoutes from './optimization.routes.js';
import recommendationRoutes from './recommendation.routes.js';
import goalRoutes from './goal.routes.js';
import chatRoutes from './chat.routes.js';

const apiRouter = Router();

// Health Check
apiRouter.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Carbonix AI REST API',
    version: '1.0.0'
  });
});

apiRouter.use('/auth', authRoutes);
apiRouter.use('/activities', activityRoutes);
apiRouter.use('/analytics', analyticsRoutes);
apiRouter.use('/predictions', predictionRoutes);
apiRouter.use('/optimization', optimizationRoutes);
apiRouter.use('/recommendations', recommendationRoutes);
apiRouter.use('/goals', goalRoutes);
apiRouter.use('/chat', chatRoutes);

export default apiRouter;
