const express = require('express');
const router = express.Router();
const web3Service = require('../services/web3');

/**
 * GET /api/dice/status
 * 获取骰子游戏状态
 */
router.get('/status', async (req, res) => {
  try {
    web3Service.initialize();
    const status = await web3Service.getDiceStatus();
    res.json({ success: true, data: status });
  } catch (error) {
    console.error('Error fetching dice status:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * GET /api/dice/history/:address
 * 获取玩家投注历史
 */
router.get('/history/:address', async (req, res) => {
  try {
    web3Service.initialize();
    const { address } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    const history = await web3Service.getPlayerDiceHistory(address, limit);
    res.json({ success: true, data: history });
  } catch (error) {
    console.error('Error fetching dice history:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * GET /api/dice/player/:address
 * 获取玩家统计
 */
router.get('/player/:address', async (req, res) => {
  try {
    web3Service.initialize();
    const { address } = req.params;
    const stats = await web3Service.getPlayerDiceStats(address);
    res.json({ 
      success: true, 
      data: { address, ...stats } 
    });
  } catch (error) {
    console.error('Error fetching player stats:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;
