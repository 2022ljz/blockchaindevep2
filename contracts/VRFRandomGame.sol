// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {IVRFCoordinatorV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/interfaces/IVRFCoordinatorV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title VRFRandomGame
 * @dev Chainlink VRF v2.5 (V2Plus) base game contract
 * @notice IMPORTANT: VRFConsumerBaseV2Plus already has ownership (ConfirmedOwner),
 *         so DO NOT inherit OpenZeppelin Ownable to avoid conflicts.
 */
abstract contract VRFRandomGame is VRFConsumerBaseV2Plus, ReentrancyGuard {
    IVRFCoordinatorV2Plus public immutable COORDINATOR;

    // v2.5: uint256 subscription id (supports very large IDs)
    uint256 public subscriptionId;

    bytes32 public keyHash;
    uint32 public callbackGasLimit = 200000;
    uint16 public requestConfirmations = 3;

    // v2.5 ExtraArgs: false = pay via LINK subscription, true = native payment (if supported)
    bool public nativePayment = false;

    // VRF request state
    mapping(uint256 => address) public requestIdToPlayer;
    mapping(uint256 => uint256) public requestIdToBetAmount;
    mapping(uint256 => bool) public requestIdFulfilled;

    // Stats
    uint256 public totalGamesPlayed;
    uint256 public totalWinnings;
    uint256 public houseEdge = 5; // 5%

    // Events
    event RandomnessRequested(uint256 indexed requestId, address indexed player);
    event RandomnessFulfilled(uint256 indexed requestId, uint256[] randomWords);
    event GameResult(address indexed player, uint256 betAmount, uint256 payout, bool won);

    event HouseEdgeUpdated(uint256 newHouseEdge);
    event FundsWithdrawn(address indexed owner, uint256 amount);
    event VRFConfigUpdated(uint256 subscriptionId, bytes32 keyHash, uint32 callbackGasLimit, uint16 requestConfirmations, bool nativePayment);

    constructor(
        address vrfCoordinator,
        uint256 _subscriptionId,
        bytes32 _keyHash
    )
        VRFConsumerBaseV2Plus(vrfCoordinator)
    {
        COORDINATOR = IVRFCoordinatorV2Plus(vrfCoordinator);
        subscriptionId = _subscriptionId;
        keyHash = _keyHash;
    }

    /**
     * @dev Request randomness (v2.5 style: RandomWordsRequest struct)
     */
    function requestRandomWords(uint32 numWords) internal returns (uint256 requestId) {
        VRFV2PlusClient.RandomWordsRequest memory req = VRFV2PlusClient.RandomWordsRequest({
            keyHash: keyHash,
            subId: subscriptionId,
            requestConfirmations: requestConfirmations,
            callbackGasLimit: callbackGasLimit,
            numWords: numWords,
            extraArgs: VRFV2PlusClient._argsToBytes(
                VRFV2PlusClient.ExtraArgsV1({ nativePayment: nativePayment })
            )
        });

        requestId = COORDINATOR.requestRandomWords(req);

        requestIdToPlayer[requestId] = msg.sender;
        emit RandomnessRequested(requestId, msg.sender);
        return requestId;
    }

    /**
     * @dev VRF callback hook; child contracts override and call super first
     */
    function fulfillRandomWords(uint256 requestId, uint256[] calldata randomWords) internal virtual override {
        require(!requestIdFulfilled[requestId], "Request already fulfilled");
        requestIdFulfilled[requestId] = true;
        emit RandomnessFulfilled(requestId, randomWords);
    }

    // -------- Owner controls (use Chainlink ConfirmedOwner's onlyOwner/owner()) --------

    function setHouseEdge(uint256 _houseEdge) external onlyOwner {
        require(_houseEdge <= 20, "House edge too high");
        houseEdge = _houseEdge;
        emit HouseEdgeUpdated(_houseEdge);
    }

    function updateVRFConfig(
        uint256 _subscriptionId,
        bytes32 _keyHash,
        uint32 _callbackGasLimit,
        uint16 _requestConfirmations,
        bool _nativePayment
    ) external onlyOwner {
        subscriptionId = _subscriptionId;
        keyHash = _keyHash;
        callbackGasLimit = _callbackGasLimit;
        requestConfirmations = _requestConfirmations;
        nativePayment = _nativePayment;

        emit VRFConfigUpdated(_subscriptionId, _keyHash, _callbackGasLimit, _requestConfirmations, _nativePayment);
    }

    function withdrawFunds(uint256 amount) external onlyOwner nonReentrant {
        require(amount <= address(this).balance, "Insufficient balance");
        (bool ok, ) = payable(owner()).call{value: amount}("");
        require(ok, "Withdraw failed");
        emit FundsWithdrawn(owner(), amount);
    }

    receive() external payable {}
}
