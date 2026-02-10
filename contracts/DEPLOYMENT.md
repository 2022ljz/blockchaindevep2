# 智能合约部署指南

本指南详细说明如何使用 Remix IDE 将合约部署到 Sepolia 测试网。

## 准备工作

### 1. 获取测试网 ETH

- 访问 [Sepolia Faucet](https://sepoliafaucet.com/)
- 连接你的钱包并获取测试 ETH

### 2. 获取 LINK 代币

- 访问 [Chainlink Faucet](https://faucets.chain.link/sepolia)
- 获取测试网 LINK 代币（用于 VRF）

### 3. 创建 VRF Subscription

1. 访问 [Chainlink VRF](https://vrf.chain.link/)
2. 切换到 Sepolia 网络
3. 点击 "Create Subscription"
4. 充值至少 5 LINK
5. 记录你的 **Subscription ID**

## Sepolia 测试网配置

```
网络名称: Sepolia
RPC URL: https://sepolia.infura.io/v3/YOUR_INFURA_KEY
Chain ID: 11155111
Symbol: ETH
Block Explorer: https://sepolia.etherscan.io/

⚠️ VRF V2.5 (V2Plus) 配置:
VRF Coordinator: 0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B
Key Hash (500 gwei): 0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae
LINK Token: 0x779877A7B0D9E8603169DdbD7836e478b4624789
```

## 部署步骤

### 步骤 1: 打开 Remix

1. 访问 https://remix.ethereum.org/
2. 创建新工作区或使用默认工作区

### 步骤 2: 导入合约

在 Remix 中创建以下文件并复制代码：

```
contracts/
├── GameToken.sol
├── VRFRandomGame.sol
├── Lottery.sol
└── DiceGame.sol
```

### 步骤 3: 编译合约

1. 点击左侧 "Solidity Compiler" 图标
2. 选择编译器版本: **0.8.19** 或更高
3. 点击 "Compile GameToken.sol"
4. 重复编译其他合约

### 步骤 4: 部署 GameToken

1. 点击 "Deploy & Run Transactions"
2. Environment 选择: **Injected Provider - MetaMask**
3. 确保 MetaMask 已连接到 Sepolia 网络
4. 选择合约: **GameToken**
5. 点击 **Deploy**
6. 在 MetaMask 中确认交易
7. 记录部署的合约地址: `TOKEN_CONTRACT=0x...`

### 步骤 5: 部署 Lottery

1. 选择合约: **Lottery**
2. **💡 重要：在 VALUE 字段输入 1 Ether 为合约充值（必需）**
3. 填写构造函数参数:
   ```
   vrfCoordinator: 0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B
   subscriptionId: YOUR_SUBSCRIPTION_ID (你在步骤3创建的)
   _keyHash: 0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae
   ```
4. 点击 **Deploy**
5. 确认交易
6. 记录合约地址: `LOTTERY_CONTRACT=0x...`

### 步骤 6: 部署 DiceGame

1. 选择合约: **DiceGame**
2. **💡 重要：在 VALUE 字段输入 1 Ether 为合约充值（必需）**
3. 使用相同的构造函数参数（与 Lottery 相同）
   ```
   vrfCoordinator: 0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B
   subscriptionId: YOUR_SUBSCRIPTION_ID
   _keyHash: 0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae
   ```
4. 点击 **Deploy**
5. 确认交易
6. 记录合约地址: `DICE_CONTRACT=0x...`

### 步骤 7: 添加消费者到 VRF Subscription

这是**关键步骤**，否则随机数请求会失败！

1. 返回 [Chainlink VRF](https://vrf.chain.link/)
2. 点击你的 Subscription
3. 点击 "Add Consumer"
4. 添加 **Lottery 合约地址**
5. 再次点击 "Add Consumer"
6. 添加 **DiceGame 合约地址**

### 步骤 8: 初始化合约（可选）

#### 为游戏合约充值 ETH

在 Remix 中，选择已部署的合约：

1. 在 "VALUE" 字段输入金额（例如 1 ETH）
2. 调用低级别的 `fallback` 或直接向合约地址转账

你也可以在 MetaMask 中直接向合约地址转账。

#### 配置游戏参数

**Lottery 配置** (可选，使用默认值)：
```javascript
updateConfig(
  ticketPrice: "10000000000000000", // 0.01 ETH (wei)
  duration: 3600,                   // 1 hour (seconds)
  maxTicketsPerUser: 100
)
```

**DiceGame 配置** (可选，使用默认值)：
```javascript
updateGameConfig(
  minBet: "1000000000000000",    // 0.001 ETH
  maxBet: "1000000000000000000", // 1 ETH
  winMultiplier: 6,
  maxPendingBets: 10
)
```

## 验证部署

### 检查 Lottery

调用以下只读函数验证部署：

```javascript
currentRound()          // 应该返回 1
ticketPrice()           // 应该返回 10000000000000000
getRoundInfo(1)         // 查看当前轮次信息
```

### 检查 DiceGame

```javascript
minBet()                // 应该返回 1000000000000000
maxBet()                // 应该返回 1000000000000000000
getGameStats()          // 查看游戏统计
```

### 检查 VRF 配置

```javascript
// Lottery
subscriptionId()        // 你的 Subscription ID
keyHash()              // VRF Key Hash
COORDINATOR()          // VRF Coordinator 地址

// DiceGame - 相同检查
```

## 更新环境变量

将部署的合约地址添加到项目的 `.env` 文件：

```env
# 合约地址
LOTTERY_CONTRACT=0xYourLotteryAddress
DICE_CONTRACT=0xYourDiceGameAddress
TOKEN_CONTRACT=0xYourTokenAddress
```

## 测试合约

### 测试 Lottery

1. **购买彩票**:
   ```javascript
   buyTickets(numberOfTickets: 1)
   // VALUE: 0.01 ETH
   ```

2. **等待抽奖时间结束** (默认1小时，或修改配置为更短时间)

3. **开奖**:
   ```javascript
   drawWinner()
   // 无需发送 ETH
   ```

4. **查看结果** (稍等几分钟等待 VRF 响应):
   ```javascript
   getRoundInfo(1)
   ```

### 测试 DiceGame

1. **下注**:
   ```javascript
   placeBet(chosenNumber: 3)  // 选择 1-6 之间的数字
   // VALUE: 0.01 ETH
   ```

2. **等待结果** (约30秒-2分钟)

3. **查看投注**:
   ```javascript
   getPlayerBetHistory(yourAddress, 10)
   // 获取最近的 requestId
   
   getBetInfo(requestId)
   // 查看投注详情和结果
   ```

## 常见问题排查

### VRF 请求失败

**症状**: 调用 `drawWinner()` 或 `placeBet()` 后没有结果

**可能原因**:
1. ❌ 合约未添加为 VRF 消费者
   - 解决: 在 VRF 控制台添加合约地址

2. ❌ Subscription 余额不足
   - 解决: 充值更多 LINK

3. ❌ Gas limit 太低
   - 解决: 调用 `updateVRFConfig()` 增加 `callbackGasLimit`

### 交易失败

**"Insufficient contract balance"**
- 合约余额不足支付赔付
- 解决: 向合约转入更多 ETH

**"Invalid number"** (DiceGame)
- 选择的数字不在 1-6 范围内

**"Round not ended yet"** (Lottery)
- 抽奖时间未到
- 解决: 等待或修改 `lotteryDuration`

## 在 Etherscan 上验证合约 (可选)

1. 访问 https://sepolia.etherscan.io/
2. 搜索你的合约地址
3. 点击 "Contract" > "Verify and Publish"
4. 选择:
   - Compiler Type: Solidity (Single file)
   - Compiler Version: v0.8.19
   - License: MIT
5. 粘贴合约代码（需要 flatten）
6. 填写构造函数参数（ABI-encoded）
7. 提交验证

## 监控和管理

### 查看事件日志

在 Etherscan 合约页面：
1. 点击 "Events" 标签
2. 查看所有游戏事件

### 提取收益（仅管理员）

```javascript
withdrawFunds(amount: "100000000000000000") // 0.1 ETH (wei)
```

### 紧急暂停（仅 Lottery）

```javascript
emergencyRefund()
// 退还当前轮次所有玩家资金
```

## 下一步

合约部署成功后：
1. ✅ 更新项目 `.env` 文件
2. ✅ 启动后端服务
3. ✅ 启动前端应用
4. ✅ 在浏览器中测试完整流程

## 安全建议

- ⚠️ 这是测试网部署，**不要在主网使用**未经审计的合约
- ⚠️ 保护好你的私钥
- ⚠️ 定期检查 VRF Subscription 余额
- ⚠️ 设置合理的投注限额
- ⚠️ 主网部署前进行完整的安全审计

## 参考链接

- [Chainlink VRF 文档](https://docs.chain.link/vrf/v2/introduction)
- [Remix IDE](https://remix.ethereum.org/)
- [Sepolia Faucet](https://sepoliafaucet.com/)
- [Etherscan Sepolia](https://sepolia.etherscan.io/)
