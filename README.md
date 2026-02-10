# 链上可验证随机游戏平台

一个基于 Chainlink VRF 的去中心化游戏平台，提供可证明公平的随机数生成。

## 项目特性

- ✅ 使用 Chainlink VRF V2 实现可验证随机数
- ✅ 彩票抽奖系统（时间驱动）
- ✅ 骰子游戏（乘数投注）
- ✅ 支持 ETH 和 ERC20 代币投注
- ✅ 自动分奖和资金池管理
- ✅ 防 MEV 攻击和作弊机制
- ✅ Web3 前端界面
- ✅ REST API 后端服务
- ✅ Docker 一键部署

## 项目结构

```
blockchaindevep2/
├── contracts/              # Solidity 智能合约
│   ├── VRFRandomGame.sol   # VRF 基础合约
│   ├── Lottery.sol         # 彩票游戏
│   ├── DiceGame.sol        # 骰子游戏
│   └── GameToken.sol       # ERC20 游戏代币
├── backend/                # Node.js 后端服务
│   ├── src/
│   ├── package.json
│   └── Dockerfile
├── frontend/               # React 前端应用
│   ├── src/
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml      # Docker 编排
└── README.md
```

## 快速开始

### 前置要求

- Node.js >= 18
- Docker & Docker Compose
- MetaMask 钱包
- 测试网 ETH (Sepolia)

### 1. 安装依赖

```bash
# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

### 2. 配置环境变量

在项目根目录创建 `.env` 文件：

```env
# Chainlink VRF 配置 (Sepolia Testnet)
VRF_COORDINATOR=0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625
VRF_KEYHASH=0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c
SUBSCRIPTION_ID=your_subscription_id

# 网络配置
RPC_URL=https://sepolia.infura.io/v3/your_infura_key
PRIVATE_KEY=your_private_key

# 合约地址（部署后填写）
LOTTERY_CONTRACT=
DICE_CONTRACT=
TOKEN_CONTRACT=

# 后端配置
BACKEND_PORT=3001
DATABASE_URL=mongodb://mongo:27017/game-platform

# 前端配置
REACT_APP_API_URL=http://localhost:3001
```

### 3. 部署智能合约

使用 Remix IDE 部署合约到 Sepolia 测试网：

1. 访问 https://remix.ethereum.org/
2. 复制 `contracts/` 目录下的所有合约文件
3. 首先部署 `GameToken.sol`
4. 然后部署 `Lottery.sol` 和 `DiceGame.sol`，传入：
   - VRF Coordinator 地址
   - Subscription ID
   - Key Hash
5. 在 Chainlink VRF 控制台添加合约为消费者
6. 将部署的合约地址更新到 `.env` 文件

### 4. 使用 Docker 启动服务

```bash
# 构建并启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

服务将在以下端口启动：
- 前端: http://localhost:3000
- 后端 API: http://localhost:3001
- MongoDB: localhost:27017

### 5. 本地开发模式

```bash
# 启动后端
cd backend
npm run dev

# 启动前端（新终端）
cd frontend
npm start
```

## 智能合约说明

### Lottery.sol - 彩票游戏

- 定时抽奖机制
- 支持 ETH 和代币投注
- 奖池自动分配
- 防重入攻击

### DiceGame.sol - 骰子游戏

- 投注 1-6 点数字
- 6倍赔率（扣除5%手续费）
- 实时结算
- MEV 保护

### VRFRandomGame.sol - VRF 基础

- Chainlink VRF V2 集成
- 回调模式处理
- 请求失败重试
- 随机数验证

## API 文档

### 获取游戏状态

```
GET /api/lottery/status
GET /api/dice/status
```

### 获取历史记录

```
GET /api/lottery/history
GET /api/dice/history
```

### 获取用户统计

```
GET /api/user/:address/stats
```

## 安全考虑

1. **随机数安全**: 使用 Chainlink VRF 确保随机数不可预测和操纵
2. **MEV 保护**: 提交-揭示模式和时间锁定
3. **重入保护**: 使用 OpenZeppelin ReentrancyGuard
4. **访问控制**: 管理员权限和紧急暂停机制
5. **经济安全**: 合理的下注限额和奖池管理

## 测试网信息

- 网络: Sepolia Testnet
- VRF Coordinator: 0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625
- LINK Token: 0x779877A7B0D9E8603169DdbD7836e478b4624789
- 测试 ETH 水龙头: https://sepoliafaucet.com/
- LINK 水龙头: https://faucets.chain.link/sepolia

## 常见问题

### 如何获取 VRF Subscription ID?

1. 访问 https://vrf.chain.link/
2. 连接 MetaMask (Sepolia 网络)
3. 创建新订阅
4. 充值 LINK 代币
5. 添加消费者合约地址

### 为什么随机数请求失败?

- 检查订阅中是否有足够的 LINK
- 确认合约已添加为消费者
- 验证网络配置是否正确

### 如何修改游戏参数?

使用管理员账户调用合约的设置函数：
- `setMinBet()` - 最小投注
- `setMaxBet()` - 最大投注
- `setHouseEdge()` - 平台抽成

## 开发路线图

- [x] 核心 VRF 集成
- [x] 彩票和骰子游戏
- [x] 前后端应用
- [x] Docker 部署
- [ ] NFT 成就系统
- [ ] 多人游戏模式
- [ ] 推荐奖励系统
- [ ] ENS 集成
- [ ] 主网部署

## 许可证

MIT License

## 联系方式

如有问题或建议，欢迎提交 Issue。
