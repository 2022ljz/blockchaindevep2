// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./VRFRandomGame.sol";

/**
 * @title DiceGame
 * @dev 基于 Chainlink VRF v2.5 的骰子游戏
 * 特性: 投注1-6点数字，猜中获得6倍赔率（扣除手续费）
 */
contract DiceGame is VRFRandomGame {
    // 游戏配置
    uint256 public minBet = 0.0001 ether;
    uint256 public maxBet = 1 ether;
    uint256 public maxPendingBets = 10;

    // 倍率配置
    uint256 public constant DICE_SIDES = 6;
    uint256 public winMultiplier = 6; // 6倍赔率

    // 投注记录
    struct Bet {
        address player;
        uint256 amount;
        uint8 chosenNumber; // 1-6
        uint256 timestamp;
        bool settled;
        bool won;
        uint8 rolledNumber;
        uint256 payout;
    }

    mapping(uint256 => Bet) public bets; // requestId => Bet
    mapping(address => uint256[]) public playerBetHistory;
    mapping(address => uint256) public playerPendingBets;
    mapping(address => uint256) public playerTotalWinnings;

    uint256 public totalBets;
    uint256 public activeBetsCount;

    // 事件
    event BetPlaced(uint256 indexed requestId, address indexed player, uint256 amount, uint8 chosenNumber);
    event DiceRolled(uint256 indexed requestId, address indexed player, uint8 rolledNumber, bool won, uint256 payout);
    event ConfigUpdated(uint256 minBet, uint256 maxBet);

    constructor(
        address vrfCoordinator,
        uint256 subscriptionId,
        bytes32 _keyHash
    ) VRFRandomGame(vrfCoordinator, subscriptionId, _keyHash) {}

    /**
     * @dev 下注
     * @param chosenNumber 选择的数字 (1-6)
     */
    function placeBet(uint8 chosenNumber) external payable nonReentrant {
        require(chosenNumber >= 1 && chosenNumber <= DICE_SIDES, "Invalid number");
        require(msg.value >= minBet && msg.value <= maxBet, "Bet amount out of range");
        require(playerPendingBets[msg.sender] < maxPendingBets, "Too many pending bets");

        // 检查合约余额是否足够支付潜在赔付
        // 注意：address(this).balance 已包含 msg.value
        uint256 maxPayout = (msg.value * winMultiplier * (100 - houseEdge)) / 100;
        require(address(this).balance >= maxPayout, "Insufficient contract balance");

        // 请求随机数（v2.5：内部使用 RandomWordsRequest）
        uint256 requestId = requestRandomWords(1);

        bets[requestId] = Bet({
            player: msg.sender,
            amount: msg.value,
            chosenNumber: chosenNumber,
            timestamp: block.timestamp,
            settled: false,
            won: false,
            rolledNumber: 0,
            payout: 0
        });

        playerBetHistory[msg.sender].push(requestId);
        playerPendingBets[msg.sender] += 1;
        totalBets += 1;
        activeBetsCount += 1;

        emit BetPlaced(requestId, msg.sender, msg.value, chosenNumber);
    }

    /**
     * @dev VRF 回调函数 - 结算投注
     * ⚠️ 必须与 base 的签名一致：uint256[] calldata
     */
    function fulfillRandomWords(uint256 requestId, uint256[] calldata randomWords) internal override {
        super.fulfillRandomWords(requestId, randomWords);

        Bet storage bet = bets[requestId];
        require(bet.player != address(0), "Invalid bet");
        require(!bet.settled, "Bet already settled");

        uint8 rolledNumber = uint8((randomWords[0] % DICE_SIDES) + 1);
        bet.rolledNumber = rolledNumber;
        bet.settled = true;

        bool won = (rolledNumber == bet.chosenNumber);
        bet.won = won;

        uint256 payout = 0;

        if (won) {
            payout = (bet.amount * winMultiplier * (100 - houseEdge)) / 100;
            bet.payout = payout;

            // ✅ 用 call 代替 transfer，避免 2300 gas 限制导致派奖失败
            (bool ok, ) = payable(bet.player).call{value: payout}("");
            require(ok, "Payout failed");

            playerTotalWinnings[bet.player] += payout;
            totalWinnings += payout;

            emit GameResult(bet.player, bet.amount, payout, true);
        } else {
            emit GameResult(bet.player, bet.amount, 0, false);
        }

        playerPendingBets[bet.player] -= 1;
        activeBetsCount -= 1;
        totalGamesPlayed += 1;

        emit DiceRolled(requestId, bet.player, rolledNumber, won, payout);
    }

    function getPlayerBetHistory(address player, uint256 limit) external view returns (uint256[] memory) {
        uint256[] storage history = playerBetHistory[player];
        uint256 length = history.length > limit ? limit : history.length;

        uint256[] memory recentBets = new uint256[](length);
        for (uint256 i = 0; i < length; i++) {
            recentBets[i] = history[history.length - 1 - i];
        }
        return recentBets;
    }

    function getBetInfo(uint256 requestId) external view returns (
        address player,
        uint256 amount,
        uint8 chosenNumber,
        uint256 timestamp,
        bool settled,
        bool won,
        uint8 rolledNumber,
        uint256 payout
    ) {
        Bet storage bet = bets[requestId];
        return (
            bet.player,
            bet.amount,
            bet.chosenNumber,
            bet.timestamp,
            bet.settled,
            bet.won,
            bet.rolledNumber,
            bet.payout
        );
    }

    function getPlayerStats(address player) external view returns (
        uint256 totalBetsCount,
        uint256 pendingBets,
        uint256 totalWon
    ) {
        return (
            playerBetHistory[player].length,
            playerPendingBets[player],
            playerTotalWinnings[player]
        );
    }

    function updateGameConfig(
        uint256 _minBet,
        uint256 _maxBet,
        uint256 _winMultiplier,
        uint256 _maxPendingBets
    ) external onlyOwner {
        require(_minBet > 0, "Min bet must be greater than 0");
        require(_maxBet > _minBet, "Max bet must be greater than min bet");
        require(_winMultiplier >= 2 && _winMultiplier <= 10, "Invalid multiplier");

        minBet = _minBet;
        maxBet = _maxBet;
        winMultiplier = _winMultiplier;
        maxPendingBets = _maxPendingBets;

        emit ConfigUpdated(_minBet, _maxBet);
    }

    function getGameStats() external view returns (
        uint256 _totalBets,
        uint256 _activeBets,
        uint256 _totalGamesPlayed,
        uint256 _totalWinnings,
        uint256 contractBalance
    ) {
        return (
            totalBets,
            activeBetsCount,
            totalGamesPlayed,
            totalWinnings,
            address(this).balance
        );
    }
}
