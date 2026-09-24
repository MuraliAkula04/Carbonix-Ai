import { PredictionService } from './prediction.service.js';

const STRATEGY_STEPS = [0, 10, 20, 30, 40, 50];
const FEASIBILITY_PENALTY = { 0: 0, 10: 5, 20: 15, 30: 30, 40: 50, 50: 75 };

const ELECTRICITY_TIPS = [
  "Switch to LED lighting and unplug standby devices to cut 10% of electricity emissions.",
  "Optimize AC/heating schedules and use smart power strips — target 20% reduction.",
  "Invest in energy-efficient appliances (A++ rated) and consider rooftop solar offsets.",
  "Conduct a home energy audit and eliminate phantom loads from all circuits.",
  "Transition lighting, heating and cooling to renewable energy sources."
];

const TRANSPORT_TIPS = [
  "Combine errands and carpool at least once a week to trim travel by 10%.",
  "Use public transit for commutes and walk/cycle for trips under 3km.",
  "Work from home 1–2 days per week, reducing commute distance by ~20–30%.",
  "Shift to an electric or hybrid vehicle for primary transportation.",
  "Eliminate car usage for routine trips; rely on transit, cycling, and remote work."
];

const FOOD_TIPS = [
  "Try one vegetarian meal per day to reduce food emissions by ~10%.",
  "Adopt Meatless Mondays and replace beef with chicken or legumes.",
  "Shift to a majority plant-based diet — proven to halve food emissions.",
  "Buy local, seasonal produce only and reduce packaged/processed food consumption.",
  "Adopt a fully plant-based or vegan diet for maximum food footprint reduction."
];

export class OptimizationService {
  /**
   * Evaluate all 216 combination strategies and rank by net benefit score
   */
  static async getOptimizationScenarios(userId, topN = 5) {
    const profile = await PredictionService.getUserProfile(userId);
    let { electricity = 0, transport = 0, food = 0 } = profile.avgByCategory;

    let total = electricity + transport + food;
    if (total === 0) {
      electricity = 120;
      transport = 140;
      food = 40;
      total = 300;
    }

    // Dynamic category weights based on user share
    const weights = {
      electricity: parseFloat(((electricity / total) * 3).toFixed(2)),
      transport: parseFloat(((transport / total) * 3).toFixed(2)),
      food: parseFloat(((food / total) * 3).toFixed(2))
    };

    const strategies = [];

    for (const e of STRATEGY_STEPS) {
      for (const t of STRATEGY_STEPS) {
        for (const f of STRATEGY_STEPS) {
          if (e === 0 && t === 0 && f === 0) continue; // Skip no-action

          const newElec = electricity * (1 - e / 100);
          const newTransport = transport * (1 - t / 100);
          const newFood = food * (1 - f / 100);
          const newTotal = newElec + newTransport + newFood;
          const savedKg = total - newTotal;

          const feasibility = Math.max(
            0,
            100 - FEASIBILITY_PENALTY[e] - FEASIBILITY_PENALTY[t] - FEASIBILITY_PENALTY[f]
          );

          const savingsScore =
            (electricity * (e / 100)) * weights.electricity +
            (transport * (t / 100)) * weights.transport +
            (food * (f / 100)) * weights.food;

          const score = parseFloat((savingsScore * 0.7 + feasibility * 0.3).toFixed(2));

          strategies.push({
            electricityReductionPct: e,
            transportReductionPct: t,
            foodReductionPct: f,
            savedKg: parseFloat(savedKg.toFixed(1)),
            newTotal: parseFloat(newTotal.toFixed(1)),
            feasibility,
            score,
            label: this.buildLabel(e, t, f),
            tips: this.buildTips(e, t, f)
          });
        }
      }
    }

    strategies.sort((a, b) => b.score - a.score);

    // Return top N distinct strategies
    const seen = new Set();
    const top = [];
    for (const s of strategies) {
      const key = `${s.electricityReductionPct}-${s.transportReductionPct}-${s.foodReductionPct}`;
      if (!seen.has(key)) {
        seen.add(key);
        top.push(s);
        if (top.length >= topN) break;
      }
    }

    return {
      currentEmissions: {
        electricity,
        transport,
        food,
        total
      },
      topStrategies: top.map((s, idx) => ({
        rank: idx + 1,
        badge: idx === 0 ? '🏆 Best Overall Strategy' : idx === 1 ? '🥈 Balanced Option' : '🥉 High Impact Alternative',
        ...s
      }))
    };
  }

  static buildLabel(e, t, f) {
    const parts = [];
    if (e > 0) parts.push(`↓${e}% electricity`);
    if (t > 0) parts.push(`↓${t}% transport`);
    if (f > 0) parts.push(`↓${f}% food impact`);
    return parts.join(' + ') || 'Baseline';
  }

  static buildTips(e, t, f) {
    const tips = [];
    if (e >= 10) tips.push(ELECTRICITY_TIPS[Math.min(Math.floor(e / 10) - 1, ELECTRICITY_TIPS.length - 1)]);
    if (t >= 10) tips.push(TRANSPORT_TIPS[Math.min(Math.floor(t / 10) - 1, TRANSPORT_TIPS.length - 1)]);
    if (f >= 10) tips.push(FOOD_TIPS[Math.min(Math.floor(f / 10) - 1, FOOD_TIPS.length - 1)]);
    return tips;
  }
}
