const express = require('express');
const router = express.Router();
const web3Service = require('../services/web3');

/**
 * GET /api/stats/overview
 * 获取平台总体统计
 */
router.get('/overview', async (req, res) => {
  try {
    web3Service.initialize();
    
    const [lotteryStatus, diceStatus] = await Promise.all([
      web3Service.getLotteryStatus().catch(() => null),
      web3Service.getDiceStatus().catch(() => null)
    ]);

    const stats = {
      lottery: lotteryStatus ? {
        currentRound: lotteryStatus.currentRound,
        prizePool: lotteryStatus.prizePool,
        totalPlayers: lotteryStatus.playerCount,
        totalTickets: lotteryStatus.totalTickets
      } : null,
      dice: diceStatus ? {
        totalGames: diceStatus.totalGamesPlayed,
        activeGames: diceStatus.activeBets,
        totalWinnings: diceStatus.totalWinnings,
        contractBalance: diceStatus.contractBalance
      } : null,
      network: {
        chainId: process.env.CHAIN_ID || '11155111',
        name: process.env.REACT_APP_NETWORK_NAME || 'Sepolia'
      }
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching overview stats:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * GET /api/stats/network
 * 获取网络信息
 */
router.get('/network', async (req, res) => {
  try {
    web3Service.initialize();
    
    const [blockNumber, gasPrice] = await Promise.all([
      web3Service.getBlockNumber(),
      web3Service.getGasPrice()
    ]);

    res.json({
      success: true,
      data: {
        blockNumber,
        gasPrice,
        chainId: process.env.CHAIN_ID || '11155111',
        rpcUrl: process.env.RPC_URL?.split('/').slice(0, 3).join('/') || 'Not configured'
      }
    });
  } catch (error) {
    console.error('Error fetching network stats:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;
