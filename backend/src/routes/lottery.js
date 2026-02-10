const express = require('express');
const router = express.Router();
const web3Service = require('../services/web3');

/**
 * GET /api/lottery/status
 * 获取当前彩票轮次状态
 */
router.get('/status', async (req, res) => {
  try {
    web3Service.initialize();
    const status = await web3Service.getLotteryStatus();
    res.json({ success: true, data: status });
  } catch (error) {
    console.error('Error fetching lottery status:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * GET /api/lottery/history
 * 获取历史轮次记录
 */
router.get('/history', async (req, res) => {
  try {
    web3Service.initialize();
    const limit = parseInt(req.query.limit) || 10;
    const history = await web3Service.getLotteryHistory(limit);
    res.json({ success: true, data: history });
  } catch (error) {
    console.error('Error fetching lottery history:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * GET /api/lottery/player/:address
 * 获取玩家在当前轮次的票数
 */
router.get('/player/:address', async (req, res) => {
  try {
    web3Service.initialize();
    const { address } = req.params;
    const tickets = await web3Service.getPlayerLotteryTickets(address);
    res.json({ 
      success: true, 
      data: { 
        address, 
        tickets 
      } 
    });
  } catch (error) {
    console.error('Error fetching player tickets:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;
