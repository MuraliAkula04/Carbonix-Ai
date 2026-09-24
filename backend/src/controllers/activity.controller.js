import { CarbonService } from '../services/carbon.service.js';
import { getEmissionFactor } from '../utils/emissionFactors.js';
import prisma from '../config/db.js';
import { AppError } from '../middleware/error.middleware.js';

export class ActivityController {
  static async create(req, res, next) {
    try {
      const { category, activityType, quantity, unit, date } = req.body;
      const activity = await CarbonService.recordActivity(req.user.id, {
        category,
        activityType,
        quantity,
        unit,
        date
      });

      res.status(201).json({
        success: true,
        message: 'Activity recorded successfully',
        data: activity
      });
    } catch (err) {
      next(err);
    }
  }

  static async batch(req, res, next) {
    try {
      const { electricity, travel, food, date } = req.body;
      const results = await CarbonService.recordMonthlyBatch(req.user.id, {
        electricity: Number(electricity) || 0,
        travel: Number(travel) || 0,
        food: food || 'mixed',
        date
      });

      res.status(201).json({
        success: true,
        message: 'Monthly activity batch recorded successfully',
        data: results
      });
    } catch (err) {
      next(err);
    }
  }

  static async preview(req, res, next) {
    try {
      const { electricity, travel, food } = req.body;
      const preview = CarbonService.calculatePreview({
        electricity: Number(electricity) || 0,
        travel: Number(travel) || 0,
        food: food || 'mixed'
      });

      res.status(200).json({
        success: true,
        data: preview
      });
    } catch (err) {
      next(err);
    }
  }

  static async getAll(req, res, next) {
    try {
      const { category, limit = 50, page = 1 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const where = {
        userId: req.user.id,
        ...(category && { category: category.toLowerCase() })
      };

      const [activities, total] = await Promise.all([
        prisma.activity.findMany({
          where,
          orderBy: { date: 'desc' },
          skip,
          take: Number(limit)
        }),
        prisma.activity.count({ where })
      ]);

      res.status(200).json({
        success: true,
        data: {
          activities,
          pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            pages: Math.ceil(total / Number(limit))
          }
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const activity = await prisma.activity.findUnique({
        where: { id }
      });

      if (!activity) {
        throw new AppError('Activity not found', 404);
      }

      if (activity.userId !== req.user.id) {
        throw new AppError('Access denied', 403);
      }

      res.status(200).json({
        success: true,
        data: activity
      });
    } catch (err) {
      next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const { category, activityType, quantity, unit, date } = req.body;

      const existing = await prisma.activity.findUnique({ where: { id } });
      if (!existing) {
        throw new AppError('Activity not found', 404);
      }
      if (existing.userId !== req.user.id) {
        throw new AppError('Access denied', 403);
      }

      const updatedCategory = category ? category.toLowerCase() : existing.category;
      const updatedType = activityType ? activityType.toLowerCase() : existing.activityType;
      const updatedQty = quantity !== undefined ? Number(quantity) : existing.quantity;

      const factor = getEmissionFactor(updatedCategory, updatedType);
      const emission = parseFloat((updatedQty * factor).toFixed(2));

      const updated = await prisma.activity.update({
        where: { id },
        data: {
          category: updatedCategory,
          activityType: updatedType,
          quantity: updatedQty,
          unit: unit || existing.unit,
          emissionFactor: factor,
          carbonEmission: emission,
          ...(date && { date: new Date(date) })
        }
      });

      res.status(200).json({
        success: true,
        message: 'Activity updated successfully',
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const existing = await prisma.activity.findUnique({ where: { id } });

      if (!existing) {
        throw new AppError('Activity not found', 404);
      }
      if (existing.userId !== req.user.id) {
        throw new AppError('Access denied', 403);
      }

      await prisma.activity.delete({ where: { id } });

      res.status(200).json({
        success: true,
        message: 'Activity deleted successfully'
      });
    } catch (err) {
      next(err);
    }
  }
}
