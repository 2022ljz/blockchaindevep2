# 🔧 紧急修复：重新部署合约

## ❌ 问题原因

您的合约代码使用了 **Chainlink VRF V2.5** 接口，但部署时使用了 **V2.0** 的 Coordinator 地址，导致所有交易失败。

错误信息：`Error: missing revert data (CALL_EXCEPTION)`

## ✅ 解决方案

需要使用正确的 VRF V2.5 参数 **重新部署** Lottery 和 DiceGame 合约。

---

## 📋 快速重新部署步骤

### 1️⃣ 在 Remix 中准备

打开 https://remix.ethereum.org/，确保已编译所有合约。

### 2️⃣ 重新部署 Lottery

**部署参数（复制使用）：**

```
✅ 正确的 VRF V2.5 参数：

vrfCoordinator (address):
0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B

subscriptionId (uint256):
101732621275221634218057789852224837651671635978470801236123284400362240931790

_keyHash (bytes32):
0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae
```

**重要：部署时充值 ETH**
- 在 Remix "VALUE" 字段输入：`1`
- 单位选择：`Ether`
- 这样合约将获得 1 ETH 余额用于支付赔付

点击 **Deploy** → 记录新地址

### 3️⃣ 重新部署 DiceGame

使用**完全相同**的参数：

```
vrfCoordinator: 0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B
subscriptionId: 101732621275221634218057789852224837651671635978470801236123284400362240931790
_keyHash: 0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae
```

**重要：部署时充值 ETH**
- VALUE: `1` Ether

点击 **Deploy** → 记录新地址

### 4️⃣ 添加到 VRF Subscription

1. 访问：https://vrf.chain.link/
2. 选择你的 Subscription
3. 点击 **"Add Consumer"**
4. 输入新的 **Lottery** 合约地址
5. 再次点击 **"Add Consumer"**
6. 输入新的 **DiceGame** 合约地址

### 5️⃣ 更新 .env 文件

编辑项目根目录的 `.env` 文件：

```env
# 更新这两行为新的合约地址
LOTTERY_CONTRACT=0xYourNewLotteryAddress
DICE_CONTRACT=0xYourNewDiceAddress

# 同时更新前端环境变量
REACT_APP_LOTTERY_CONTRACT=0xYourNewLotteryAddress
REACT_APP_DICE_CONTRACT=0xYourNewDiceAddress
```

### 6️⃣ 重启 Docker

**方法一：使用 start.bat（推荐，简单）**

```bash
# 1. 先停止旧容器
docker-compose down

# 2. 直接运行启动脚本（会自动重建）
.\start.bat
```

**方法二：手动分步执行**

```bash
# 停止旧容器
docker-compose down

# 重建前端（包含新的合约地址）
docker-compose build --no-cache frontend

# 启动所有服务
docker-compose up -d
```

### 7️⃣ 测试

1. 打开浏览器：http://localhost:3000
2. 刷新页面（Ctrl+F5）
3. 连接 MetaMask
4. 尝试下注骰子游戏
5. 应该成功！30-120 秒后查看结果

---

## 🔍 验证部署是否成功

在 Remix 中调用新部署的 DiceGame 合约：

```solidity
// 1. 检查 VRF 配置
COORDINATOR() 
// 应该返回: 0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B ✅

subscriptionId()
// 应该返回你的大数字 ID ✅

// 2. 检查合约余额
getBalance()
// 应该返回: 1000000000000000000 (1 ETH) ✅

// 3. 检查游戏配置
minBet()      // 应该返回: 1000000000000000 (0.001 ETH)
maxBet()      // 应该返回: 1000000000000000000 (1 ETH)
winMultiplier() // 应该返回: 6
```

---

## ⚠️ 对比：错误 vs 正确配置

| 参数 | ❌ 旧配置 (V2.0) | ✅ 新配置 (V2.5) |
|------|-----------------|-----------------|
| VRF Coordinator | 0x8103...4625 | 0x9Ddfa...8B1B |
| Key Hash | 0x474e3... | 0x787d7... |
| 接口 | VRFConsumerBaseV2 | VRFConsumerBaseV2Plus |
| Subscription ID 类型 | uint64 (不够大) | uint256 (正确) |

---

## 💡 为什么需要重新部署？

1. **合约地址是不可变的** - 无法修改已部署合约的 Coordinator 地址
2. **接口不兼容** - V2.5 的 Coordinator 不接受 V2.0 的调用方式
3. **合约余额为 0** - 旧合约没有余额，无法支付赔付

---

## 📞 完成后检查清单

- [ ] Lottery 重新部署，地址已记录
- [ ] DiceGame 重新部署，地址已记录
- [ ] 两个合约都在部署时充值了 1 ETH
- [ ] 两个合约都添加到 VRF Subscription 消费者列表
- [ ] .env 文件已更新新地址（两处）
- [ ] Docker 容器已重建并重启
- [ ] 浏览器已刷新（Ctrl+F5）
- [ ] 测试下注成功

---

## 🎯 预期结果

✅ 下注时不再出现 "missing revert data" 错误  
✅ MetaMask 提示确认交易  
✅ 交易成功，显示 "Bet placed!"  
✅ 30-120 秒后 Chainlink VRF 返回结果  
✅ 前端显示骰子点数和输赢结果

---

## 🆘 如果仍然失败

检查：
1. Sepolia 测试网 ETH 余额是否充足（至少 0.1 ETH）
2. VRF Subscription 是否有足够 LINK（至少 5 LINK）
3. 合约地址是否正确添加到消费者列表
4. MetaMask 是否连接到 Sepolia 网络
5. 浏览器控制台是否有其他错误

---

**准备好了吗？开始重新部署！** 🚀
