import prisma from '../config/db.js';

export class AnalyticsService {
  /**
   * Get user emission summary: total, current month, average daily, highest category, comparison
   */
  static async getUserSummary(userId) {
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // Fetch all user activities
    const activities = await prisma.activity.findMany({
      where: { userId },
      orderBy: { date: 'asc' }
    });

    if (activities.length === 0) {
      return {
        totalEmission: 0,
        averageDailyEmission: 0,
        highestCategory: 'none',
        currentMonth: 0,
        previousMonth: 0,
        previousMonthComparison: 0,
        activityCount: 0
      };
    }

    const totalEmission = activities.reduce((sum, a) => sum + a.carbonEmission, 0);

    // Current month activities
    const currentMonthActivities = activities.filter(a => new Date(a.date) >= startOfCurrentMonth);
    const currentMonthEmission = currentMonthActivities.reduce((sum, a) => sum + a.carbonEmission, 0);

    // Previous month activities
    const previousMonthActivities = activities.filter(
      a => new Date(a.date) >= startOfPreviousMonth && new Date(a.date) <= endOfPreviousMonth
    );
    const previousMonthEmission = previousMonthActivities.reduce((sum, a) => sum + a.carbonEmission, 0);

    // Calculate percentage change
    let comparison = 0;
    if (previousMonthEmission > 0) {
      comparison = parseFloat((((currentMonthEmission - previousMonthEmission) / previousMonthEmission) * 100).toFixed(1));
    }

    // Category aggregations for all time
    const categoryTotals = {};
    for (const a of activities) {
      categoryTotals[a.category] = (categoryTotals[a.category] || 0) + a.carbonEmission;
    }

    let highestCategory = 'none';
    let highestVal = -1;
    for (const [cat, val] of Object.entries(categoryTotals)) {
      if (val > highestVal) {
        highestVal = val;
        highestCategory = cat;
      }
    }

    // Days span calculation for average daily emission
    const firstDate = new Date(activities[0].date);
    const daysDiff = Math.max(1, Math.ceil((now - firstDate) / (1000 * 60 * 60 * 24)));
    const averageDailyEmission = parseFloat((totalEmission / daysDiff).toFixed(2));

    return {
      totalEmission: parseFloat(totalEmission.toFixed(1)),
      averageDailyEmission,
      highestCategory,
      currentMonth: parseFloat(currentMonthEmission.toFixed(1)),
      previousMonth: parseFloat(previousMonthEmission.toFixed(1)),
      previousMonthComparison: comparison,
      activityCount: activities.length
    };
  }

  /**
   * Category breakdown (transport, electricity, food, etc.)
   */
  static async getCategoryBreakdown(userId) {
    const activities = await prisma.activity.findMany({
      where: { userId }
    });

    const categories = {
      electricity: 0,
      transport: 0,
      food: 0
    };

    for (const a of activities) {
      const cat = a.category === 'travel' ? 'transport' : a.category;
      categories[cat] = (categories[cat] || 0) + a.carbonEmission;
    }

    return Object.entries(categories).map(([category, emission]) => ({
      category,
      emission: parseFloat(emission.toFixed(1))
    }));
  }

  /**
   * Monthly emission trends for the last 6-12 months
   */
  static async getMonthlyTrends(userId, monthsCount = 6) {
    const activities = await prisma.activity.findMany({
      where: { userId },
      orderBy: { date: 'asc' }
    });

    const monthMap = new Map();
    const now = new Date();

    // Initialize past N months in chronological order
    for (let i = monthsCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString('default', { month: 'short' });
      monthMap.set(key, { label, year: d.getFullYear(), emission: 0, electricity: 0, transport: 0, food: 0 });
    }

    // Populate actual activity emissions
    for (const a of activities) {
      const d = new Date(a.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (monthMap.has(key)) {
        const item = monthMap.get(key);
        item.emission += a.carbonEmission;
        const cat = a.category === 'travel' ? 'transport' : a.category;
        if (cat in item) {
          item[cat] += a.carbonEmission;
        }
      }
    }

    return Array.from(monthMap.values()).map(m => ({
      label: m.label,
      total: parseFloat(m.emission.toFixed(1)),
      electricity: parseFloat(m.electricity.toFixed(1)),
      transport: parseFloat(m.transport.toFixed(1)),
      food: parseFloat(m.food.toFixed(1))
    }));
  }
}
