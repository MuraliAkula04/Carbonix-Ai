import { RecommendationService } from '../services/recommendation.service.js';

export class RecommendationController {
  static async getRecommendations(req, res, next) {
    try {
      const recommendations = await RecommendationService.getRecommendations(req.user.id);
      res.status(200).json({
        success: true,
        data: recommendations
      });
    } catch (err) {
      next(err);
    }
  }
}
