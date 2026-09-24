import { getEmissionFactor, EMISSION_FACTORS } from '../utils/emissionFactors.js';
import prisma from '../config/db.js';

export class CarbonService {
  /**
   * Calculate single activity emission and record with emissionFactor stored
   */
  static async recordActivity(userId, { category, activityType, quantity, unit, date }) {
    const emissionFactor = getEmissionFactor(category, activityType);
    const carbonEmission = parseFloat((quantity * emissionFactor).toFixed(2));

    const activity = await prisma.activity.create({
      data: {
        userId,
        category: category.toLowerCase(),
        activityType: activityType.toLowerCase(),
        quantity,
        unit,
        emissionFactor,
        carbonEmission,
        date: date ? new Date(date) : new Date()
      }
    });

    return activity;
  }

  /**
   * Record a full monthly batch (electricity, travel, food) from the dashboard form
   */
  static async recordMonthlyBatch(userId, { electricity = 0, travel = 0, food = 'mixed', date = new Date() }) {
    const records = [];
    const recordDate = new Date(date);

    // 1. Electricity
    if (electricity > 0) {
      const elecFactor = getEmissionFactor('electricity', 'grid');
      records.push(
        prisma.activity.create({
          data: {
            userId,
            category: 'electricity',
            activityType: 'grid',
            quantity: electricity,
            unit: 'kWh',
            emissionFactor: elecFactor,
            carbonEmission: parseFloat((electricity * elecFactor).toFixed(2)),
            date: recordDate
          }
        })
      );
    }

    // 2. Travel
    if (travel > 0) {
      const travelFactor = getEmissionFactor('transport', 'car');
      records.push(
        prisma.activity.create({
          data: {
            userId,
            category: 'transport',
            activityType: 'car',
            quantity: travel,
            unit: 'km',
            emissionFactor: travelFactor,
            carbonEmission: parseFloat((travel * travelFactor).toFixed(2)),
            date: recordDate
          }
        })
      );
    }

    // 3. Food
    if (food) {
      const foodFactor = getEmissionFactor('food', food);
      records.push(
        prisma.activity.create({
          data: {
            userId,
            category: 'food',
            activityType: food,
            quantity: 1,
            unit: 'month',
            emissionFactor: foodFactor,
            carbonEmission: parseFloat(foodFactor.toFixed(2)),
            date: recordDate
          }
        })
      );
    }

    return await prisma.$transaction(records);
  }

  /**
   * Preview calculation without persisting
   */
  static calculatePreview({ electricity = 0, travel = 0, food = 'mixed' }) {
    const elecFactor = getEmissionFactor('electricity', 'grid');
    const travelFactor = getEmissionFactor('transport', 'car');
    const foodFactor = getEmissionFactor('food', food);

    const elecEmission = parseFloat((electricity * elecFactor).toFixed(1));
    const travelEmission = parseFloat((travel * travelFactor).toFixed(1));
    const foodEmission = parseFloat(foodFactor.toFixed(1));
    const total = parseFloat((elecEmission + travelEmission + foodEmission).toFixed(1));

    return {
      electricity: elecEmission,
      travel: travelEmission,
      food: foodEmission,
      total,
      breakdown: {
        electricityPercentage: total > 0 ? parseFloat(((elecEmission / total) * 100).toFixed(1)) : 0,
        travelPercentage: total > 0 ? parseFloat(((travelEmission / total) * 100).toFixed(1)) : 0,
        foodPercentage: total > 0 ? parseFloat(((foodEmission / total) * 100).toFixed(1)) : 0
      }
    };
  }
}
