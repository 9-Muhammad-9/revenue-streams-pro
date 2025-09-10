class MiningCalculator {
  constructor() {
    this.currentRates = {
      bitcoin: 50000,
      ethereum: 3000,
      monero: 150
    };
    this.difficultyLevels = {
      bitcoin: 25,
      ethereum: 12,
      monero: 8
    };
  }
  
  calculateEarnings(hashrate, cryptocurrency = 'bitcoin') {
    const rate = this.currentRates[cryptocurrency];
    const difficulty = this.difficultyLevels[cryptocurrency];
    
    // Realistic earnings calculation formula
    const dailyEarnings = (hashrate / (difficulty * 1000000)) * rate * 0.8;
    return {
      daily: dailyEarnings,
      weekly: dailyEarnings * 7,
      monthly: dailyEarnings * 30
    };
  }
  
  updateRates(newRates) {
    this.currentRates = { ...this.currentRates, ...newRates };
  }
  
  getMiningSuggestions() {
    return {
      optimalCoin: 'bitcoin',
      suggestedHashrate: 50,
      estimatedDailyEarnings: this.calculateEarnings(50, 'bitcoin').daily
    };
  }
}

// Initialize mining calculator
const miningCalculator = new MiningCalculator();

// Export for use in other files
window.MiningCalculator = miningCalculator;
