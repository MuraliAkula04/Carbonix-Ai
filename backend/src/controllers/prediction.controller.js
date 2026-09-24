import { PredictionService } from '../services/prediction.service.js';

export class PredictionController {
  static async predict(req, res, next) {
    try {
      const { reduceElecPct, reduceTransportPct, reduceFoodPct } = req.body;
      const prediction = await PredictionService.predictNextMonth(req.user.id, {
        reduceElecPct: Number(reduceElecPct) || 0,
        reduceTransportPct: Number(reduceTransportPct) || 0,
        reduceFoodPct: Number(reduceFoodPct) || 0
      });

      res.status(200).json({
        success: true,
        data: prediction
      });
    } catch (err) {
      next(err);
    }
  }

  static async getProfile(req, res, next) {
    try {
      const profile = await PredictionService.getUserProfile(req.user.id);
      res.status(200).json({
        success: true,
        data: profile
      });
    } catch (err) {
      next(err);
    }
  }
}
