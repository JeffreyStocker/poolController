module.exports = class WeightedAverage {
  constructor() {
    this.totalWeight = 0;
    this.currentAverage = 0;
  }

  add(val, weight) {
    if (typeof val !== 'number' || typeof weight !== 'number') {
      throw new Error ('val and weight must be numbers');
    }
    this.currentAverage = ((val * weight) + (this.totalWeight * this.currentAverage)) / (weight + this.totalWeight);
    this.totalWeight = weight + this.totalWeight;
    return this.currentAverage;
  }

  return() {
    return this.currentAverage;
  }
};