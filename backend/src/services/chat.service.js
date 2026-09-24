import { AnalyticsService } from './analytics.service.js';
import { PredictionService } from './prediction.service.js';
import { RecommendationService } from './recommendation.service.js';
import prisma from '../config/db.js';

const SUSTAINABILITY_KEYWORDS = [
  'carbon', 'footprint', 'energy', 'electricity', 'power', 'kwh',
  'transport', 'transportation', 'car', 'flight', 'travel', 'drive', 'bus', 'train', 'cycle',
  'food', 'diet', 'meat', 'vegan', 'vegetarian', 'eat', 'grocery',
  'sustainability', 'sustainable', 'eco', 'green', 'environment', 'climate', 'co2', 'emission',
  'reduce', 'goal', 'target', 'offset', 'recycle', 'renewable', 'solar', 'wind',
  'tip', 'advice', 'help', 'improve', 'better', 'less', 'lower', 'cut',
  'prediction', 'forecast', 'trend', 'history', 'track', 'data', 'month', 'hello', 'hi'
];

const REJECTION_PHRASES = [
  "I'm Carbonix AI, specialized in sustainability and environmental topics only. Try asking me about reducing your electricity consumption, travel emissions, or optimizing your dietary footprint!",
  "That topic is outside my domain. As your Carbonix AI sustainability advisor, I can help you analyze your carbon data, predict next month's emissions, or set reduction targets.",
  "I'm dedicated exclusively to carbon management and eco-action. Ask me: 'How can I reduce my transportation emissions this month?'"
];

export class ChatService {
  /**
   * Process user chat message with context building and sustainability guard
   */
  static async processMessage(userId, message) {
    const text = message.trim();
    const lower = text.toLowerCase();

    // 1. Topic Guard: Reject non-sustainability queries
    const isTopicAllowed = SUSTAINABILITY_KEYWORDS.some(k => lower.includes(k));
    if (!isTopicAllowed) {
      const fallback = REJECTION_PHRASES[Math.floor(Math.random() * REJECTION_PHRASES.length)];
      return {
        reply: fallback,
        isGuarded: true
      };
    }

    // 2. Build User Context from Database
    const [summary, profile, recommendations, goals] = await Promise.all([
      AnalyticsService.getUserSummary(userId),
      PredictionService.getUserProfile(userId),
      RecommendationService.getRecommendations(userId),
      prisma.goal.findMany({ where: { userId, status: 'IN_PROGRESS' }, take: 2 })
    ]);

    // 3. Generate Knowledge Response using Context
    let reply = '';

    if (/electr|power|kwh|energy|light|ac|appliance|solar/.test(lower)) {
      const elec = profile.avgByCategory?.electricity || summary.currentMonth;
      reply = `⚡ **Electricity Insights**: Your monthly electricity emissions average around **${elec} kg CO₂**. ` +
        `Top ways to save: switch to LED bulbs (up to 80% reduction), utilize smart timers for HVAC, and disconnect standby electronics to stop phantom power draw.`;
    } else if (/transport|car|vehicle|commute|flight|fly|train|bus|bike|cycle|walk/.test(lower)) {
      const trans = profile.avgByCategory?.transport || 0;
      reply = `🚗 **Transport Insights**: Your transportation emissions stand at roughly **${trans} kg CO₂/month**. ` +
        `Shifting just 2 commutes per week to public transit or carpooling can reduce this category by 25–40%. For short trips under 3km, walking or cycling produces 0 kg CO₂!`;
    } else if (/food|diet|meat|vegan|vegetarian|eat|beef|plant/.test(lower)) {
      const food = profile.avgByCategory?.food || 0;
      reply = `🥗 **Dietary Footprint**: Food contributes approximately **${food} kg CO₂** to your profile. ` +
        `Did you know meat-heavy diets emit ~3.5x more greenhouse gases than plant-centric options? Adopting 'Meatless Mondays' can easily save 15–25 kg CO₂ monthly.`;
    } else if (/goal|target|progress|status/.test(lower)) {
      if (goals.length > 0) {
        const g = goals[0];
        const current = summary.currentMonth;
        const diff = current - g.targetEmission;
        if (diff <= 0) {
          reply = `🏆 **Goal Update**: Excellent job! Your current monthly emission of **${current} kg CO₂** is well within your goal of **${g.targetEmission} kg CO₂**! Keep maintaining these habits.`;
        } else {
          reply = `🎯 **Goal Update**: Your active goal "${g.title}" targets **${g.targetEmission} kg CO₂**. You are currently at **${current} kg CO₂** (need to cut **${diff.toFixed(1)} kg** to hit target).`;
        }
      } else {
        reply = `🎯 You haven't set an active reduction goal yet! Setting a 10% reduction target is a proven way to build momentum. Visit the Goals section to create one.`;
      }
    } else if (/predict|forecast|next month|trend|future/.test(lower)) {
      const pred = await PredictionService.predictNextMonth(userId);
      reply = `📈 **Next Month Forecast**: Based on your past trends (${profile.trend}), we project your upcoming monthly emissions at **${pred.predictedTotal} kg CO₂** (vs current ${pred.currentTotal} kg CO₂). ` +
        `${pred.label}. Use the interactive sliders on the Predictions page to test reduction scenarios!`;
    } else if (/hi|hello|hey|help/.test(lower)) {
      reply = `👋 Hello! I'm **Carbonix AI**, your personal sustainability intelligence assistant. ` +
        `I have live access to your activity records: your current monthly emission is **${summary.currentMonth} kg CO₂**, and your highest source is **${summary.highestCategory}**. ` +
        `How can I assist you with energy reduction, travel optimization, or dietary tips today?`;
    } else {
      // General sustainability advice tailored to highest category
      const topRec = recommendations[0];
      reply = `🌱 **Personalized Sustainability Recommendation**: Based on your records, your highest emission driver is **${summary.highestCategory}**. ` +
        (topRec ? `We recommend: **${topRec.title}** — ${topRec.description}` : `Tracking your daily habits is the fastest route to meaningful reduction!`);
    }

    // 4. Save Chat Log to Database
    try {
      await prisma.chatMessage.createMany({
        data: [
          { userId, role: 'user', message: text },
          { userId, role: 'assistant', message: reply }
        ]
      });
    } catch (e) {
      console.warn('Could not persist chat message:', e);
    }

    return {
      reply,
      isGuarded: false
    };
  }
}
