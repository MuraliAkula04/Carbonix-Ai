import prisma from '../config/db.js';
import { AnalyticsService } from '../services/analytics.service.js';
import { AppError } from '../middleware/error.middleware.js';

export class GoalController {
  static async create(req, res, next) {
    try {
      const { title, targetEmission, startDate, endDate } = req.body;

      const goal = await prisma.goal.create({
        data: {
          userId: req.user.id,
          title,
          targetEmission: Number(targetEmission),
          startDate: startDate ? new Date(startDate) : new Date(),
          endDate: endDate ? new Date(endDate) : null,
          status: 'IN_PROGRESS'
        }
      });

      res.status(201).json({
        success: true,
        message: 'Goal created successfully',
        data: goal
      });
    } catch (err) {
      next(err);
    }
  }

  static async getAll(req, res, next) {
    try {
      const goals = await prisma.goal.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' }
      });

      const summary = await AnalyticsService.getUserSummary(req.user.id);
      const currentMonthEmission = summary.currentMonth;

      // Augment goals with live progress status
      const enrichedGoals = goals.map(g => {
        const achieved = currentMonthEmission <= g.targetEmission && currentMonthEmission > 0;
        const remaining = Math.max(0, currentMonthEmission - g.targetEmission);
        const progressPct =
          g.targetEmission > 0
            ? Math.min(100, Math.round((currentMonthEmission / g.targetEmission) * 100))
            : 0;

        return {
          ...g,
          currentMonthEmission,
          achieved,
          remainingKgToCut: remaining,
          progressPercentage: progressPct
        };
      });

      res.status(200).json({
        success: true,
        data: enrichedGoals
      });
    } catch (err) {
      next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const { title, targetEmission, status, endDate } = req.body;

      const existing = await prisma.goal.findUnique({ where: { id } });
      if (!existing) {
        throw new AppError('Goal not found', 404);
      }
      if (existing.userId !== req.user.id) {
        throw new AppError('Access denied', 403);
      }

      const updated = await prisma.goal.update({
        where: { id },
        data: {
          ...(title && { title }),
          ...(targetEmission !== undefined && { targetEmission: Number(targetEmission) }),
          ...(status && { status }),
          ...(endDate && { endDate: new Date(endDate) })
        }
      });

      res.status(200).json({
        success: true,
        message: 'Goal updated successfully',
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const existing = await prisma.goal.findUnique({ where: { id } });
      if (!existing) {
        throw new AppError('Goal not found', 404);
      }
      if (existing.userId !== req.user.id) {
        throw new AppError('Access denied', 403);
      }

      await prisma.goal.delete({ where: { id } });

      res.status(200).json({
        success: true,
        message: 'Goal deleted successfully'
      });
    } catch (err) {
      next(err);
    }
  }
}
