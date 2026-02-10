# Chainlink VRF V2.5 配置指南

## 🔴 重要：您的合约使用 VRF V2.5，需要特定配置

### 1. VRF V2.5 Sepolia 网络参数

```
VRF Coordinator (v2.5): 0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B
Key Hash (500 gwei):    0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae
```

### 2. 重新部署合约（必需！）

您之前部署的合约使用了错误的 Coordinator 地址，需要重新部署：

#### A. 在 Remix 中重新部署 DiceGame

```solidity
Constructor 参数:
- vrfCoordinator: 0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B
- subscriptionId: 101732621275221634218057789852224837651671635978470801236123284400362240931790
- _keyHash: 0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae
```

#### B. 重新部署 Lottery

```solidity
Constructor 参数:
- vrfCoordinator: 0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B
- subscriptionId: 101732621275221634218057789852224837651671635978470801236123284400362240931790
- _keyHash: 0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae
```

### 3. 为合约充值 ETH

**这是必需的！** DiceGame 需要合约余额来支付赔付：

在 Remix 部署界面：
1. 在 "VALUE" 字段输入：`1` (1 ETH)
2. 选择 "Ether" 单位
3. 部署合约 → **合约将自动获得 1 ETH 余额**

或部署后充值：
```
在 MetaMask 中向合约地址转账 0.5-1 ETH
```

### 4. 添加消费者到 VRF Subscription

访问 https://vrf.chain.link/
1. 选择你的 Subscription
2. "Add Consumer" → 输入新的 DiceGame 合约地址
3. "Add Consumer" → 输入新的 Lottery 合约地址

### 5. 更新 .env 文件

```env
# VRF V2.5 Configuration
VRF_COORDINATOR=0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B
VRF_KEYHASH=0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae
SUBSCRIPTION_ID=101732621275221634218057789852224837651671635978470801236123284400362240931790

# 新的合约地址
LOTTERY_CONTRACT=0xYourNewLotteryAddress
DICE_CONTRACT=0xYourNewDiceAddress
TOKEN_CONTRACT=0xC0862Ece05A8E14B761F99fBadD92282721A499b

# Frontend
REACT_APP_LOTTERY_CONTRACT=0xYourNewLotteryAddress
REACT_APP_DICE_CONTRACT=0xYourNewDiceAddress
```

### 6. 重新启动应用

```bash
# 停止容器
docker-compose down

# 重建镜像（包含新的合约地址）
docker-compose build --no-cache frontend

# 启动
docker-compose up -d
```

---

## 🧪 测试步骤

### 1. 检查合约余额

在 Remix 中调用 DiceGame：
```solidity
getBalance()
```
应该返回：> 0 (至少 0.1 ETH)

### 2. 检查 VRF 配置

```solidity
COORDINATOR() → 0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B
subscriptionId() → 你的大数字 ID
keyHash() → 0x787d...
```

### 3. 测试下注

前端下注 0.01 ETH：
- 应该成功
- 30-120秒后看到结果

---

## ❌ 常见错误

### "Insufficient contract balance"
```
✅ 解决：向合约地址转账 0.5+ ETH
```

### "Consumer not found" / "Invalid consumer"
```
✅ 解决：在 vrf.chain.link 添加合约地址到消费者列表
```

### "missing revert data" (你当前的错误)
```
✅ 原因：使用了 v2.0 Coordinator 但合约是 v2.5 接口
✅ 解决：重新部署合约，使用 v2.5 Coordinator 地址
```

---

## 📋 部署检查清单

- [ ] 使用正确的 VRF Coordinator: `0x9Ddfa...`
- [ ] 使用正确的 Key Hash: `0x787d7...`
- [ ] 合约部署时充值了 1 ETH (或部署后转账)
- [ ] 合约已添加到 VRF Subscription 消费者
- [ ] .env 文件更新了新的合约地址和 VRF 参数
- [ ] Docker 容器已重建（`docker-compose build --no-cache frontend`）
- [ ] 前端可以连接钱包
- [ ] 测试下注成功

---

## 🔗 参考链接

- VRF V2.5 文档: https://docs.chain.link/vrf/v2-5/overview
- Sepolia 配置: https://docs.chain.link/vrf/v2-5/supported-networks#sepolia-testnet
- VRF 订阅管理: https://vrf.chain.link/
