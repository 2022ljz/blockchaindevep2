# 快速开始指南

完整的从零到部署的快速指南。

## 🚀 5分钟快速启动

### 步骤 1: 准备测试网资源 (5-10分钟)-----已经替你搞定了

1. **安装 MetaMask**
   - https://metamask.io/

2. **切换到 Sepolia 测试网**
   - MetaMask → 网络下拉菜单 → Sepolia

3. **获取测试 ETH**
   - https://sepoliafaucet.com/
   - 需要 0.5-1 ETH

4. **获取 LINK 代币**
   - https://faucets.chain.link/sepolia
   - 需要 10 LINK

5. **创建 VRF Subscription**
   - https://vrf.chain.link/
   - Create Subscription → 充值 5 LINK
   - **记录 Subscription ID** ⭐

### 步骤 2: 部署智能合约 (10分钟)-----已经弄好了，俩合约地址放下面了；如果给游戏充值直接走metamask就行，先少充点试试
lottery：0x0Db68993aDe96e48BF2DE8e55c83A7C22915f3D4
dicegame：0xBce0FFc10F55Af8CD91F8f2d99d83B49482eccd8

1. **打开 Remix IDE**
   ```
   https://remix.ethereum.org/
   ```

2. **创建文件并复制代码**
   - contracts/GameToken.sol
   - contracts/VRFRandomGame.sol
   - contracts/Lottery.sol
   - contracts/DiceGame.sol

3. **编译**
   - Compiler: 0.8.19
   - 编译所有文件

4. **部署 (依次执行)**

   **A. 部署 GameToken**
   ```
   Contract: GameToken
   参数: 无
   → Deploy → 记录地址
   ```

   **B. 部署 Lottery**
   ```
   Contract: Lottery
   参数 (⚠️ VRF V2.5):
   - vrfCoordinator: 0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B
   - subscriptionId: YOUR_SUBSCRIPTION_ID
   - _keyHash: 0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae
   
   💡 建议：在 VALUE 字段输入 1 Ether，为合约充值
   → Deploy → 记录地址
   ```

   **C. 部署 DiceGame**
   ```
   Contract: DiceGame
   参数 (⚠️ VRF V2.5，与 Lottery 相同):
   - vrfCoordinator: 0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B
   - subscriptionId: YOUR_SUBSCRIPTION_ID
   - _keyHash: 0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae
   
   💡 建议：在 VALUE 字段输入 1 Ether，为合约充值
   → Deploy → 记录地址
   ```

5. **添加消费者到 VRF**
   - 返回 https://vrf.chain.link/
   - 点击你的 Subscription
   - Add Consumer → 输入 Lottery 合约地址
   - Add Consumer → 输入 DiceGame 合约地址

6. **为合约充值 ETH (可选但推荐)**
   - 在 Remix 中，向每个游戏合约转 0.5 ETH
   - 或在 MetaMask 中直接转账

### 步骤 3: 配置项目 (2分钟)-----我没把.env放到gitignore里直接给你了

1. **复制环境变量文件**
   ```bash
   cp .env.example .env
   ```

2. **编辑 .env 文件**
   ```env
   # 必需配置
   RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
   LOTTERY_CONTRACT=0xYourLotteryAddress
   DICE_CONTRACT=0xYourDiceAddress
   TOKEN_CONTRACT=0xYourTokenAddress
   SUBSCRIPTION_ID=your_subscription_id
   ```

   获取 Infura Key:
   - https://infura.io/
   - 注册 → 创建项目 → 复制 Project ID

### 步骤 4: 启动应用 (3分钟)------直接跑docker脚本就行

**选项 A: Docker (推荐)**

```bash
# Windows
start.bat

# Linux/Mac
chmod +x start.sh
./start.sh
```

**选项 B: 本地开发**

```bash
# 终端 1 - 后端
cd backend
npm install
npm run dev

# 终端 2 - 前端
cd frontend
npm install
npm start
```

### 步骤 5: 测试游戏 (5分钟)

1. **打开浏览器**
   ```
   http://localhost:3000
   ```

2. **连接钱包**
   - 点击 "Connect Wallet"
   - 在 MetaMask 中批准

3. **测试彩票**
   - 导航到 "Lottery"
   - 购买 1-5 张票
   - 等待轮次结束 (默认 1 小时，可在合约中修改)
   - 点击 "Draw Winner"

4. **测试骰子**
   - 导航到 "Dice Game"
   - 选择数字 (1-6)
   - 输入金额 (0.01 ETH)
   - 点击 "Place Bet"
   - 等待 30-120 秒查看结果

---

## 🔧 常见配置调整

### 缩短彩票轮次时间

在 Remix 中调用 Lottery 合约:

```solidity
updateConfig(
  ticketPrice: "1000000000000000",  // 0.001 ETH
  duration: 300,                      // 5分钟 (用于测试)
  maxTicketsPerUser: 100
)
```
默认0.001ETH，30s，100

### 调整骰子游戏参数

```solidity
updateGameConfig(
  minBet: "1000000000000000",    // 0.001 ETH
  maxBet: "100000000000000000",  // 0.1 ETH
  winMultiplier: 6,
  maxPendingBets: 10
)
```
默认0.0001-1，6，10
---

## 📊 验证部署

### 1. 检查合约

在 Remix "Deployed Contracts" 中调用:

**Lottery:**
```
currentRound() → 应该返回 1
ticketPrice() → 应该返回 10000000000000000
```

**DiceGame:**
```
minBet() → 应该返回 1000000000000000
winMultiplier() → 应该返回 6
```

### 2. 检查 VRF 配置

```
subscriptionId() → 你的 ID
COORDINATOR() → 0x8103...
```

### 3. 检查后端 API

```bash
curl http://localhost:3001/api/health
```

应该返回:
```json
{
  "status": "ok",
  "timestamp": "...",
  "mongodb": "connected"
}
```

### 4. 检查前端

访问 http://localhost:3000
- 应该看到首页
- 统计数据显示
- 可以连接钱包

---

## 🐛 快速故障排查

### VRF 请求失败

```
❌ 错误: Subscription not found
✅ 解决: 检查 subscriptionId 是否正确
```

```
❌ 错误: Consumer not found
✅ 解决: 在 VRF 控制台添加合约地址
```

```
❌ 错误: Insufficient LINK
✅ 解决: 充值更多 LINK 到 Subscription
```

### 交易失败

```
❌ 错误: Insufficient funds
✅ 解决: 获取更多测试 ETH
```

```
❌ 错误: Execution reverted
✅ 解决: 在 Sepolia Etherscan 查看详细错误
```

### Docker 问题

```
❌ 错误: port is already allocated
✅ 解决: 
  docker-compose down
  修改 docker-compose.yml 中的端口
```

```
❌ 错误: Cannot connect to database
✅ 解决:
  docker-compose logs mongo
  docker-compose restart mongo
```

---

## 📚 下一步

✅ 完成快速启动后:

1. **阅读完整文档**
   - [README.md](README.md)
   - [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
   - [contracts/DEPLOYMENT.md](contracts/DEPLOYMENT.md)

2. **了解代码结构**
   - 智能合约: `contracts/`
   - 后端 API: `backend/src/`
   - 前端应用: `frontend/src/`

3. **自定义配置**
   - 修改游戏参数
   - 自定义 UI
   - 添加新功能

4. **进阶功能**
   - 实现 NFT 成就
   - 添加推荐系统
   - 集成 ENS

---

## 🎯 测试清单

完成以下任务确保一切正常:

- [ ] 成功部署所有合约
- [ ] 合约添加到 VRF 消费者
- [ ] 后端 API 正常响应
- [ ] 前端正确显示
- [ ] 钱包成功连接
- [ ] 购买彩票票成功
- [ ] 彩票开奖成功
- [ ] 骰子投注成功
- [ ] 骰子结果返回
- [ ] Profile 显示统计

---

## 💡 提示

- 🔥 **测试时使用少量 ETH** - 0.01-0.05 足够
- ⏰ **VRF 响应需要时间** - 通常 30 秒到 2 分钟
- 🔄 **刷新页面** - 如果数据未更新
- 📝 **查看日志** - `docker-compose logs -f` 排查问题
- 💾 **备份私钥** - 导出 MetaMask 私钥以防丢失

---

## 🆘 获取帮助

遇到问题?

1. 查看 [故障排查](#快速故障排查) 部分
2. 检查 [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
3. 查看 Docker 日志
4. 在 Etherscan 查看交易详情
5. 提交 GitHub Issue

---

**祝你好运！🎲🎰**
