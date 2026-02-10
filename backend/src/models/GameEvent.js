const mongoose = require('mongoose');

const gameEventSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['lottery', 'dice'],
    required: true
  },
  event: {
    type: String,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  transactionHash: String,
  blockNumber: Number,
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

gameEventSchema.index({ type: 1, timestamp: -1 });
gameEventSchema.index({ 'data.player': 1 });

module.exports = mongoose.model('GameEvent', gameEventSchema);
