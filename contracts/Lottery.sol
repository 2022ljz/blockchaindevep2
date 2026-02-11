// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./VRFRandomGame.sol";

/**
 * @title Lottery
 * @dev 基于 Chainlink VRF 的彩票游戏
 * 特性: 定时抽奖、奖池累积、多玩家参与
 */
contract Lottery is VRFRandomGame {
    uint256 public ticketPrice = 0.001 ether;
    uint256 public lotteryDuration = 30 seconds;
    uint256 public maxTicketsPerUser = 100;

    uint256 public currentRound;
    uint256 public roundStartTime;
    uint256 public totalPrizePool;

    struct Round {
        uint256 roundId;
        uint256 startTime;
        uint256 endTime;
        uint256 prizePool;
        uint256 totalTickets;
        address[] players;
        address winner;
        uint256 winningTicket;
        uint256 vrfRequestId;
        bool drawn;
        bool prizeClaimed;
    }

    mapping(uint256 => Round) public rounds;
    mapping(uint256 => mapping(address => uint256)) public roundTickets; // roundId => player => tickets
    mapping(address => uint256) public playerTotalWinnings;

    event LotteryStarted(uint256 indexed roundId, uint256 startTime);
    event TicketPurchased(uint256 indexed roundId, address indexed player, uint256 tickets);
    event DrawInitiated(uint256 indexed roundId, uint256 vrfRequestId);
    event WinnerSelected(uint256 indexed roundId, address indexed winner, uint256 prize);
    event PrizeClaimed(uint256 indexed roundId, address indexed winner, uint256 prize);
    event ConfigUpdated(uint256 ticketPrice, uint256 duration);

    constructor(
        address vrfCoordinator,
        uint256 subscriptionId,
        bytes32 _keyHash
    ) VRFRandomGame(vrfCoordinator, subscriptionId, _keyHash) {
        _startNewRound();
    }

    function buyTickets(uint256 numberOfTickets) external payable nonReentrant {
        // 自动开启新轮次的情况：
        // 1. 轮次结束 && 无人购票 && 未开奖
        // 2. 轮次结束 && 已开奖（无论有无票）
        if (isRoundEnded()) {
            if ((rounds[currentRound].totalTickets == 0 && !rounds[currentRound].drawn) || 
                rounds[currentRound].drawn) {
                _startNewRound();
            }
        }

        require(numberOfTickets > 0, "Must buy at least 1 ticket");
        require(msg.value == ticketPrice * numberOfTickets, "Incorrect payment");
        require(!isRoundEnded(), "Current round ended");
        require(
            roundTickets[currentRound][msg.sender] + numberOfTickets <= maxTicketsPerUser,
            "Exceeds max tickets per user"
        );

        // 新玩家加入列表
        if (roundTickets[currentRound][msg.sender] == 0) {
            rounds[currentRound].players.push(msg.sender);
        }

        roundTickets[currentRound][msg.sender] += numberOfTickets;
        rounds[currentRound].totalTickets += numberOfTickets;
        rounds[currentRound].prizePool += msg.value;
        totalPrizePool += msg.value;

        emit TicketPurchased(currentRound, msg.sender, numberOfTickets);
    }

    function drawWinner() external nonReentrant {
        require(isRoundEnded(), "Round not ended yet");
        require(!rounds[currentRound].drawn, "Already drawn");
        require(rounds[currentRound].totalTickets > 0, "No tickets sold");

        rounds[currentRound].drawn = true;
        rounds[currentRound].endTime = block.timestamp;

        uint256 requestId = requestRandomWords(1);
        rounds[currentRound].vrfRequestId = requestId;

        // 复用 requestIdToBetAmount 存 roundId
        requestIdToBetAmount[requestId] = currentRound;

        emit DrawInitiated(currentRound, requestId);
    }

    // ⚠️ v2.5 base 常用 calldata，这里用 calldata 更稳
    // ✅ 终极简化版本：移除所有不必要操作，最小化 gas
    function fulfillRandomWords(uint256 requestId, uint256[] calldata randomWords) internal override {
        // ✅ 移除 super 调用，减少 gas
        uint256 roundId = requestIdToBetAmount[requestId];
        Round storage round = rounds[roundId];

        // ✅ 移除所有 require 检查，减少 gas
        // 直接计算并存储，假设数据有效
        if (round.totalTickets > 0 && round.winner == address(0)) {
            uint256 winningTicket = (randomWords[0] % round.totalTickets) + 1;
            round.winningTicket = winningTicket;
            round.winner = _findWinnerByTicket(roundId, winningTicket);
            totalGamesPlayed++;
            emit WinnerSelected(roundId, round.winner, round.prizePool);
        }
    }

    function _findWinnerByTicket(uint256 roundId, uint256 ticketNumber) private view returns (address) {
        Round storage round = rounds[roundId];
        uint256 counter = 0;

        for (uint256 i = 0; i < round.players.length; i++) {
            address player = round.players[i];
            uint256 tickets = roundTickets[roundId][player];
            counter += tickets;

            if (counter >= ticketNumber) return player;
        }
        return address(0);
    }

    /**
     * @notice 获胜者领取奖励
     * @param roundId 轮次 ID
     */
    function claimPrize(uint256 roundId) external nonReentrant {
        Round storage round = rounds[roundId];
        
        require(round.winner == msg.sender, "Not the winner");
        require(round.winner != address(0), "No winner yet");
        require(!round.prizeClaimed, "Prize already claimed");
        require(round.prizePool > 0, "No prize to claim");

        round.prizeClaimed = true;
        
        uint256 prize = (round.prizePool * (100 - houseEdge)) / 100;
        playerTotalWinnings[msg.sender] += prize;
        totalWinnings += prize;
        totalPrizePool -= round.prizePool;

        (bool success, ) = payable(msg.sender).call{value: prize}("");
        require(success, "Prize transfer failed");

        emit PrizeClaimed(roundId, msg.sender, prize);
    }

    function _startNewRound() private {
        currentRound++;
        roundStartTime = block.timestamp;

        rounds[currentRound] = Round({
            roundId: currentRound,
            startTime: block.timestamp,
            endTime: 0,
            prizePool: 0,
            totalTickets: 0,
            players: new address[](0), // ✅ 修复：必须是动态数组
            winner: address(0),
            winningTicket: 0,
            vrfRequestId: 0,
            drawn: false,
            prizeClaimed: false
        });

        emit LotteryStarted(currentRound, block.timestamp);
    }

    function isRoundEnded() public view returns (bool) {
        return block.timestamp >= roundStartTime + lotteryDuration;
    }

    function getCurrentPrizePool() external view returns (uint256) {
        return rounds[currentRound].prizePool;
    }

    function getPlayerTickets(address player) external view returns (uint256) {
        return roundTickets[currentRound][player];
    }

    function getRoundInfo(uint256 roundId) external view returns (
        uint256 startTime,
        uint256 endTime,
        uint256 prizePool,
        uint256 totalTickets,
        uint256 playerCount,
        address winner,
        bool drawn,
        bool prizeClaimed
    ) {
        Round storage round = rounds[roundId];
        return (
            round.startTime,
            round.endTime,
            round.prizePool,
            round.totalTickets,
            round.players.length,
            round.winner,
            round.drawn,
            round.prizeClaimed
        );
    }

    function getRoundPlayers(uint256 roundId) external view returns (address[] memory) {
        return rounds[roundId].players;
    }

    function updateConfig(
        uint256 _ticketPrice,
        uint256 _duration,
        uint256 _maxTicketsPerUser
    ) external onlyOwner {
        require(_ticketPrice > 0, "Invalid ticket price");
        // ❌ 原代码：require(_duration >= 10 minutes, "Duration too short");
        require(_duration >= 1 seconds, "Duration too short"); // ✅ 修改为允许短时间测试

        ticketPrice = _ticketPrice;
        lotteryDuration = _duration;
        maxTicketsPerUser = _maxTicketsPerUser;

        emit ConfigUpdated(_ticketPrice, _duration);
    }

    /**
     * @dev 管理员强制开启新轮次（仅在异常情况下使用）
     */
    function forceStartNewRound() external onlyOwner {
        _startNewRound();
    }

    function emergencyRefund() external onlyOwner nonReentrant {
        require(!rounds[currentRound].drawn, "Round already drawn");

        Round storage round = rounds[currentRound];

        for (uint256 i = 0; i < round.players.length; i++) {
            address player = round.players[i];
            uint256 tickets = roundTickets[currentRound][player];
            uint256 refundAmount = tickets * ticketPrice;

            if (refundAmount > 0) {
                (bool ok, ) = payable(player).call{value: refundAmount}("");
                require(ok, "Refund failed");
            }
        }

        _startNewRound();
    }
}
