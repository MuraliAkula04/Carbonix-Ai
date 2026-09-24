import { AnalyticsService } from './analytics.service.js';
import { OptimizationService } from './optimization.service.js';
import prisma from '../config/db.js';

export class RecommendationService {
  /**
   * Generate personalized recommendations based on actual user activity patterns
   */
  static async getRecommendations(userId) {
    const summary = await AnalyticsService.getUserSummary(userId);
    const optimization = await OptimizationService.getOptimizationScenarios(userId, 3);
    const activeGoals = await prisma.goal.findMany({
      where: { userId, status: 'IN_PROGRESS' }
    });

    const recommendations = [];

    // Highest category targeted recommendation
    if (summary.highestCategory === 'electricity') {
      recommendations.push({
        id: 'rec-elec-1',
        category: 'electricity',
        title: 'Optimize Household Power Consumption',
        description: 'Electricity is your largest carbon source. Switching to LED fixtures and adjusting HVAC setpoints by 1.5°C can cut emissions by up to 25%.',
        potentialReduction: 35.0,
        impact: 'High',
        icon: 'bolt'
      });
      recommendations.push({
        id: 'rec-elec-2',
        category: 'electricity',
        title: 'Eliminate Phantom Loads',
        description: 'Use smart power strips for entertainment centers and home offices to avoid vampire drain.',
        potentialReduction: 12.0,
        impact: 'Medium',
        icon: 'plug'
      });
    } else if (summary.highestCategory === 'transport' || summary.highestCategory === 'travel') {
      recommendations.push({
        id: 'rec-trans-1',
        category: 'transport',
        title: 'Combine Commutes & Transition to Rail',
        description: 'Transportation is your dominant emission source. Combining trips, carpooling 2x/week, or substituting urban drives with train or cycling reduces commute carbon by 40%.',
        potentialReduction: 45.0,
        impact: 'High',
        icon: 'car'
      });
      recommendations.push({
        id: 'rec-trans-2',
        category: 'transport',
        title: 'Micro-Mobility for Short Distances',
        description: 'For errands under 3km, walking or e-cycling produces 0g CO2/km while boosting daily wellness.',
        potentialReduction: 15.0,
        impact: 'Medium',
        icon: 'bicycle'
      });
    } else if (summary.highestCategory === 'food') {
      recommendations.push({
        id: 'rec-food-1',
        category: 'food',
        title: 'Adopt Plant-Forward Meal Planning',
        description: 'Dietary habits generate significant emissions. Instituting Meatless Mondays and swapping beef with poultry or legumes saves ~50 kg CO2 monthly.',
        potentialReduction: 30.0,
        impact: 'High',
        icon: 'utensils'
      });
    }

    // Add top optimization strategy as an actionable pathway
    if (optimization.topStrategies.length > 0) {
      const best = optimization.topStrategies[0];
      recommendations.push({
        id: 'rec-opt-best',
        category: 'optimization',
        title: `Recommended Strategy: ${best.label}`,
        description: `Our optimization engine calculated that this balanced scenario saves ${best.savedKg} kg CO2 with a high feasibility score of ${best.feasibility}%.`,
        potentialReduction: best.savedKg,
        impact: 'Very High',
        icon: 'chart-line',
        tips: best.tips
      });
    }

    // Trend-based encouragement or caution
    if (summary.previousMonthComparison > 10) {
      recommendations.push({
        id: 'rec-trend-alert',
        category: 'trend',
        title: 'Emission Surge Detected',
        description: `Your emissions increased by ${summary.previousMonthComparison}% compared to last month. Review your recent transport and electricity logs.`,
        potentialReduction: 20.0,
        impact: 'Attention',
        icon: 'exclamation-triangle'
      });
    }

    // Goal-aligned recommendation
    if (activeGoals.length > 0) {
      const goal = activeGoals[0];
      recommendations.push({
        id: 'rec-goal-progress',
        category: 'goal',
        title: `Active Goal: ${goal.title}`,
        description: `Targeting ${goal.targetEmission} kg CO2. Keep logging regular activities to track your milestone achievement!`,
        potentialReduction: 10.0,
        impact: 'Goal Tracking',
        icon: 'bullseye'
      });
    }

    return recommendations;
  }
}
