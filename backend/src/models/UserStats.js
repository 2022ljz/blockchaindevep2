const mongoose = require('mongoose');

const userStatsSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  lotteryStats: {
    ticketsPurchased: { type: Number, default: 0 },
    roundsParticipated: { type: Number, default: 0 },
    totalSpent: { type: String, default: '0' },
    totalWon: { type: String, default: '0' },
    wins: { type: Number, default: 0 }
  },
  diceStats: {
    totalBets: { type: Number, default: 0 },
    totalSpent: { type: String, default: '0' },
    totalWon: { type: String, default: '0' },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 }
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

userStatsSchema.index({ address: 1 });

module.exports = mongoose.model('UserStats', userStatsSchema);
