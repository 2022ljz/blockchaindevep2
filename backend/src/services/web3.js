const { ethers } = require('ethers');
require('dotenv').config();

// Contract ABIs (简化版本，包含主要函数)
const LOTTERY_ABI = [
  "function currentRound() view returns (uint256)",
  "function getRoundInfo(uint256 roundId) view returns (uint256 startTime, uint256 endTime, uint256 prizePool, uint256 totalTickets, uint256 playerCount, address winner, bool drawn)",
  "function getRoundPlayers(uint256 roundId) view returns (address[])",
  "function getPlayerTickets(address player) view returns (uint256)",
  "function ticketPrice() view returns (uint256)",
  "function lotteryDuration() view returns (uint256)",
  "function isRoundEnded() view returns (bool)",
  "function buyTickets(uint256 numberOfTickets) payable",
  "function drawWinner()",
  "event TicketPurchased(uint256 indexed roundId, address indexed player, uint256 tickets)",
  "event WinnerSelected(uint256 indexed roundId, address indexed winner, uint256 prize)",
  "event LotteryStarted(uint256 indexed roundId, uint256 startTime)"
];

const DICE_ABI = [
  "function getGameStats() view returns (uint256 totalBets, uint256 activeBets, uint256 totalGamesPlayed, uint256 totalWinnings, uint256 contractBalance)",
  "function getBetInfo(uint256 requestId) view returns (address player, uint256 amount, uint8 chosenNumber, uint256 timestamp, bool settled, bool won, uint8 rolledNumber, uint256 payout)",
  "function getPlayerBetHistory(address player, uint256 limit) view returns (uint256[])",
  "function getPlayerStats(address player) view returns (uint256 totalBetsCount, uint256 pendingBets, uint256 totalWon)",
  "function minBet() view returns (uint256)",
  "function maxBet() view returns (uint256)",
  "function winMultiplier() view returns (uint256)",
  "function placeBet(uint8 chosenNumber) payable",
  "event BetPlaced(uint256 indexed requestId, address indexed player, uint256 amount, uint8 chosenNumber)",
  "event DiceRolled(uint256 indexed requestId, address indexed player, uint8 rolledNumber, bool won, uint256 payout)"
];

class Web3Service {
  constructor() {
    this.provider = null;
    this.lotteryContract = null;
    this.diceContract = null;
    this.initialized = false;
  }

  initialize() {
    if (this.initialized) return;

    try {
      // Setup provider
      const rpcUrl = process.env.RPC_URL || 'https://sepolia.infura.io/v3/YOUR_KEY';
      this.provider = new ethers.JsonRpcProvider(rpcUrl);

      // Initialize contracts
      if (process.env.LOTTERY_CONTRACT) {
        this.lotteryContract = new ethers.Contract(
          process.env.LOTTERY_CONTRACT,
          LOTTERY_ABI,
          this.provider
        );
      }

      if (process.env.DICE_CONTRACT) {
        this.diceContract = new ethers.Contract(
          process.env.DICE_CONTRACT,
          DICE_ABI,
          this.provider
        );
      }

      this.initialized = true;
      console.log('✅ Web3 service initialized');
    } catch (error) {
      console.error('❌ Web3 initialization error:', error.message);
    }
  }

  // Lottery methods
  async getLotteryStatus() {
    if (!this.lotteryContract) throw new Error('Lottery contract not initialized');

    const currentRound = await this.lotteryContract.currentRound();
    const roundInfo = await this.lotteryContract.getRoundInfo(currentRound);
    const ticketPrice = await this.lotteryContract.ticketPrice();
    const duration = await this.lotteryContract.lotteryDuration();
    const isEnded = await this.lotteryContract.isRoundEnded();
    const startTime = Number(roundInfo[0]);

    return {
      currentRound: currentRound.toString(),
      startTime,
      endTime: Number(roundInfo[1]),
      prizePool: ethers.formatEther(roundInfo[2]),
      totalTickets: Number(roundInfo[3]),
      playerCount: Number(roundInfo[4]),
      winner: roundInfo[5],
      drawn: roundInfo[6],
      ticketPrice: ethers.formatEther(ticketPrice),
      duration: Number(duration),
      isEnded
    };
  }

  async getLotteryHistory(limit = 10) {
    if (!this.lotteryContract) throw new Error('Lottery contract not initialized');

    const currentRound = await this.lotteryContract.currentRound();
    const rounds = [];

    for (let i = Math.max(1, Number(currentRound) - limit); i < currentRound; i++) {
      const roundInfo = await this.lotteryContract.getRoundInfo(i);
      rounds.push({
        roundId: i,
        startTime: Number(roundInfo[0]),
        endTime: Number(roundInfo[1]),
        prizePool: ethers.formatEther(roundInfo[2]),
        totalTickets: Number(roundInfo[3]),
        playerCount: Number(roundInfo[4]),
        winner: roundInfo[5],
        drawn: roundInfo[6]
      });
    }

    return rounds;
  }

  async getPlayerLotteryTickets(address) {
    if (!this.lotteryContract) throw new Error('Lottery contract not initialized');
    const tickets = await this.lotteryContract.getPlayerTickets(address);
    return Number(tickets);
  }

  // Dice game methods
  async getDiceStatus() {
    if (!this.diceContract) throw new Error('Dice contract not initialized');

    const stats = await this.diceContract.getGameStats();
    const minBet = await this.diceContract.minBet();
    const maxBet = await this.diceContract.maxBet();
    const multiplier = await this.diceContract.winMultiplier();

    return {
      totalBets: Number(stats[0]),
      activeBets: Number(stats[1]),
      totalGamesPlayed: Number(stats[2]),
      totalWinnings: ethers.formatEther(stats[3]),
      contractBalance: ethers.formatEther(stats[4]),
      minBet: ethers.formatEther(minBet),
      maxBet: ethers.formatEther(maxBet),
      winMultiplier: Number(multiplier)
    };
  }

  async getPlayerDiceHistory(address, limit = 20) {
    if (!this.diceContract) throw new Error('Dice contract not initialized');

    const requestIds = await this.diceContract.getPlayerBetHistory(address, limit);
    const bets = [];

    for (const requestId of requestIds) {
      const betInfo = await this.diceContract.getBetInfo(requestId);
      bets.push({
        requestId: requestId.toString(),
        player: betInfo[0],
        amount: ethers.formatEther(betInfo[1]),
        chosenNumber: Number(betInfo[2]),
        timestamp: Number(betInfo[3]),
        settled: betInfo[4],
        won: betInfo[5],
        rolledNumber: Number(betInfo[6]),
        payout: ethers.formatEther(betInfo[7])
      });
    }

    return bets;
  }

  async getPlayerDiceStats(address) {
    if (!this.diceContract) throw new Error('Dice contract not initialized');

    const stats = await this.diceContract.getPlayerStats(address);
    return {
      totalBetsCount: Number(stats[0]),
      pendingBets: Number(stats[1]),
      totalWon: ethers.formatEther(stats[2])
    };
  }

  // Utility methods
  async getBlockNumber() {
    return await this.provider.getBlockNumber();
  }

  async getGasPrice() {
    const feeData = await this.provider.getFeeData();
    return {
      gasPrice: ethers.formatUnits(feeData.gasPrice, 'gwei'),
      maxFeePerGas: ethers.formatUnits(feeData.maxFeePerGas, 'gwei'),
      maxPriorityFeePerGas: ethers.formatUnits(feeData.maxPriorityFeePerGas, 'gwei')
    };
  }
}

// Export singleton instance
const web3Service = new Web3Service();
module.exports = web3Service;
