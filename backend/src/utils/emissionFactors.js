/**
 * Centralized Emission Factors for Carbonix AI
 * Units: kg CO2 equivalent per activity unit
 * Documented sources: IPCC Guidelines, DEFRA, US EPA Greenhouse Gas Reporting Program
 */

export const EMISSION_FACTORS = {
  electricity: {
    grid: 0.82,       // kg CO2 per kWh (default grid average)
    solar: 0.04,      // kg CO2 per kWh lifecycle
    wind: 0.02,       // kg CO2 per kWh lifecycle
    default: 0.82
  },
  transport: {
    car: 0.21,        // kg CO2 per km (average petrol/diesel car)
    motorcycle: 0.11, // kg CO2 per km
    bus: 0.08,        // kg CO2 per passenger-km
    train: 0.04,      // kg CO2 per passenger-km
    flight: 0.25,     // kg CO2 per passenger-km (average domestic/short haul)
    walking: 0.0,     // zero emission
    cycling: 0.0,     // zero emission
    default: 0.21
  },
  food: {
    meat: 70.0,       // kg CO2 per month (or diet period factor)
    heavy_meat: 70.0,
    mixed: 40.0,      // kg CO2 per month
    vegetarian: 20.0, // kg CO2 per month
    vegan: 15.0,      // kg CO2 per month
    default: 40.0
  }
};

export const GLOBAL_BASELINE = 340; // kg CO2/month baseline for an average citizen

/**
 * Resolve emission factor based on category and activityType
 */
export function getEmissionFactor(category, activityType) {
  const cat = category?.toLowerCase();
  const type = activityType?.toLowerCase();

  if (cat === 'electricity') {
    return EMISSION_FACTORS.electricity[type] ?? EMISSION_FACTORS.electricity.default;
  }
  if (cat === 'transport' || cat === 'travel') {
    return EMISSION_FACTORS.transport[type] ?? EMISSION_FACTORS.transport.default;
  }
  if (cat === 'food') {
    return EMISSION_FACTORS.food[type] ?? EMISSION_FACTORS.food.default;
  }
  return 1.0;
}
