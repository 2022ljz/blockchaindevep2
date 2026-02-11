export const LOTTERY_ABI = [
  "function currentRound() view returns (uint256)",
  "function getRoundInfo(uint256 roundId) view returns (uint256 startTime, uint256 endTime, uint256 prizePool, uint256 totalTickets, uint256 playerCount, address winner, bool drawn, bool prizeClaimed)",
  "function getPlayerTickets(address player) view returns (uint256)",
  "function ticketPrice() view returns (uint256)",
  "function buyTickets(uint256 numberOfTickets) payable",
  "function drawWinner()",
  "function claimPrize(uint256 roundId)",
  "event TicketPurchased(uint256 indexed roundId, address indexed player, uint256 tickets)",
  "event WinnerSelected(uint256 indexed roundId, address indexed winner, uint256 prize)",
  "event PrizeClaimed(uint256 indexed roundId, address indexed winner, uint256 prize)"
];

export const DICE_ABI = [
  "function minBet() view returns (uint256)",
  "function maxBet() view returns (uint256)",
  "function winMultiplier() view returns (uint256)",
  "function getGameStats() view returns (uint256 totalBets, uint256 activeBets, uint256 totalGamesPlayed, uint256 totalWinnings, uint256 contractBalance)",
  "function placeBet(uint8 chosenNumber) payable",
  "event BetPlaced(uint256 indexed requestId, address indexed player, uint256 amount, uint8 chosenNumber)",
  "event DiceRolled(uint256 indexed requestId, address indexed player, uint8 rolledNumber, bool won, uint256 payout)"
];

export const LOTTERY_ADDRESS = process.env.REACT_APP_LOTTERY_CONTRACT || '';
export const DICE_ADDRESS = process.env.REACT_APP_DICE_CONTRACT || '';
