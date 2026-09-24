import { OptimizationService } from '../services/optimization.service.js';

export class OptimizationController {
  static async getScenarios(req, res, next) {
    try {
      const { topN = 5 } = req.query;
      const scenarios = await OptimizationService.getOptimizationScenarios(req.user.id, Number(topN));
      res.status(200).json({
        success: true,
        data: scenarios
      });
    } catch (err) {
      next(err);
    }
  }
}
