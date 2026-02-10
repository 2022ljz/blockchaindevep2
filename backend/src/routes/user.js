const express = require('express');
const router = express.Router();
const web3Service = require('../services/web3');
const UserStats = require('../models/UserStats');

/**
 * GET /api/user/:address/stats
 * 获取用户完整统计
 */
router.get('/:address/stats', async (req, res) => {
  try {
    web3Service.initialize();
    const { address } = req.params;
    
    // 从区块链获取实时数据
    const [lotteryTickets, diceStats] = await Promise.all([
      web3Service.getPlayerLotteryTickets(address).catch(() => 0),
      web3Service.getPlayerDiceStats(address).catch(() => ({
        totalBetsCount: 0,
        pendingBets: 0,
        totalWon: '0'
      }))
    ]);

    // 尝试从数据库获取历史统计
    let dbStats = null;
    if (UserStats.db.readyState === 1) {
      dbStats = await UserStats.findOne({ address: address.toLowerCase() });
    }

    res.json({
      success: true,
      data: {
        address,
        lottery: {
          currentTickets: lotteryTickets,
          ...dbStats?.lotteryStats
        },
        dice: {
          ...diceStats,
          ...dbStats?.diceStats
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;
