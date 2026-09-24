import { AnalyticsService } from '../services/analytics.service.js';

export class AnalyticsController {
  static async getSummary(req, res, next) {
    try {
      const summary = await AnalyticsService.getUserSummary(req.user.id);
      res.status(200).json({
        success: true,
        data: summary
      });
    } catch (err) {
      next(err);
    }
  }

  static async getCategories(req, res, next) {
    try {
      const categories = await AnalyticsService.getCategoryBreakdown(req.user.id);
      res.status(200).json({
        success: true,
        data: categories
      });
    } catch (err) {
      next(err);
    }
  }

  static async getMonthly(req, res, next) {
    try {
      const { months = 6 } = req.query;
      const trends = await AnalyticsService.getMonthlyTrends(req.user.id, Number(months));
      res.status(200).json({
        success: true,
        data: trends
      });
    } catch (err) {
      next(err);
    }
  }
}
