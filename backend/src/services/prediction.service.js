import prisma from '../config/db.js';

export class PredictionService {
  /**
   * Derive behavioral user profile from recent activity history
   */
  static async getUserProfile(userId) {
    const activities = await prisma.activity.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 50
    });

    if (activities.length === 0) {
      return {
        avgByCategory: { electricity: 0, transport: 0, food: 0 },
        avgTotal: 0,
        trend: 'stable',
        streaks: { electricity: 0, transport: 0, food: 0 },
        recordCount: 0,
        highestCategory: 'electricity'
      };
    }

    // Group activities by month
    const monthlyTotals = new Map();
    for (const a of activities) {
      const d = new Date(a.date);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      if (!monthlyTotals.has(key)) {
        monthlyTotals.set(key, { electricity: 0, transport: 0, food: 0, total: 0 });
      }
      const item = monthlyTotals.get(key);
      const cat = a.category === 'travel' ? 'transport' : a.category;
      if (item[cat] !== undefined) item[cat] += a.carbonEmission;
      item.total += a.carbonEmission;
    }

    const months = Array.from(monthlyTotals.values());
    const count = Math.max(months.length, 1);

    const sumElec = months.reduce((s, m) => s + m.electricity, 0);
    const sumTransport = months.reduce((s, m) => s + m.transport, 0);
    const sumFood = months.reduce((s, m) => s + m.food, 0);
    const sumTotal = months.reduce((s, m) => s + m.total, 0);

    const avgElec = parseFloat((sumElec / count).toFixed(1));
    const avgTransport = parseFloat((sumTransport / count).toFixed(1));
    const avgFood = parseFloat((sumFood / count).toFixed(1));
    const avgTotal = parseFloat((sumTotal / count).toFixed(1));

    // Trend calculation: compare earlier half vs recent half
    let trend = 'stable';
    if (months.length >= 2) {
      const mid = Math.floor(months.length / 2);
      const recent = months.slice(0, mid).reduce((s, m) => s + m.total, 0) / Math.max(mid, 1);
      const past = months.slice(mid).reduce((s, m) => s + m.total, 0) / Math.max(months.length - mid, 1);
      const diff = recent - past;
      if (diff > 15) trend = 'increasing';
      else if (diff < -15) trend = 'decreasing';
    }

    const highestCategory =
      avgElec >= avgTransport && avgElec >= avgFood
        ? 'electricity'
        : avgTransport >= avgFood
        ? 'transport'
        : 'food';

    return {
      avgByCategory: { electricity: avgElec, transport: avgTransport, food: avgFood },
      avgTotal,
      trend,
      recordCount: activities.length,
      highestCategory
    };
  }

  /**
   * Predict next month emissions with optional reduction scenario percentages
   */
  static async predictNextMonth(userId, { reduceElecPct = 0, reduceTransportPct = 0, reduceFoodPct = 0 } = {}) {
    const profile = await this.getUserProfile(userId);

    // Current baseline emissions
    let currentElec = profile.avgByCategory.electricity;
    let currentTransport = profile.avgByCategory.transport;
    let currentFood = profile.avgByCategory.food;

    // If user has zero records yet, use typical baseline values
    if (profile.recordCount === 0) {
      currentElec = 120;
      currentTransport = 140;
      currentFood = 40;
    }

    const currentTotal = parseFloat((currentElec + currentTransport + currentFood).toFixed(1));

    let trendFactor = 1.05;
    if (profile.trend === 'decreasing') trendFactor = 0.97;
    if (profile.trend === 'increasing') trendFactor = 1.10;
    if (profile.trend === 'stable') trendFactor = 1.02;

    const predElec = Math.max(0, currentElec * trendFactor * (1 - reduceElecPct / 100));
    const predTransport = Math.max(0, currentTransport * trendFactor * (1 - reduceTransportPct / 100));
    const predFood = Math.max(0, currentFood * trendFactor * (1 - reduceFoodPct / 100));
    const predictedTotal = parseFloat((predElec + predTransport + predFood).toFixed(1));

    const trendLabel =
      profile.trend === 'increasing'
        ? '⚠️ Your emissions are trending up'
        : profile.trend === 'decreasing'
        ? '✅ Your emissions are improving'
        : '→ Your emissions are stable';

    return {
      currentTotal,
      predictedTotal,
      trendFactor,
      label: trendLabel,
      isEstimate: true,
      breakdown: {
        electricity: parseFloat(predElec.toFixed(1)),
        transport: parseFloat(predTransport.toFixed(1)),
        food: parseFloat(predFood.toFixed(1))
      },
      appliedReductions: {
        electricity: reduceElecPct,
        transport: reduceTransportPct,
        food: reduceFoodPct
      }
    };
  }
}
