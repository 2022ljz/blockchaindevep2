# 部署和使用指南

本文档详细说明如何部署和使用区块链游戏平台。

## 📋 目录

1. [前置要求](#前置要求)
2. [智能合约部署](#智能合约部署)
3. [本地开发环境](#本地开发环境)
4. [Docker 部署](#docker-部署)
5. [使用指南](#使用指南)
6. [故障排查](#故障排查)

---

## 前置要求

### 必需软件

- **Node.js** >= 18.0.0
- **Docker** >= 20.10
- **Docker Compose** >= 2.0
- **MetaMask** 浏览器扩展

### 测试网准备

1. **获取 Sepolia ETH**
   - 访问 https://sepoliafaucet.com/
   - 连接钱包获取测试 ETH

2. **获取 LINK 代币**
   - 访问 https://faucets.chain.link/sepolia
   - 获取 LINK (用于 VRF)

3. **创建 VRF Subscription**
   - 访问 https://vrf.chain.link/
   - 创建订阅并充值 5+ LINK
   - 记录 Subscription ID

---

## 智能合约部署

详细步骤请参考 [contracts/DEPLOYMENT.md](contracts/DEPLOYMENT.md)

### 快速步骤

1. 打开 https://remix.ethereum.org/
2. 复制 `contracts/` 目录下所有文件
3. 编译器版本选择 **0.8.19**
4. 按顺序部署:
   - GameToken.sol
   - Lottery.sol (需要 VRF 参数)
   - DiceGame.sol (需要 VRF 参数)
5. 在 VRF 控制台添加合约为消费者
6. 记录所有合约地址

### VRF 配置参数 (Sepolia)

```
vrfCoordinator: 0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625
subscriptionId: YOUR_SUBSCRIPTION_ID
keyHash: 0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c
```

---

## 本地开发环境

### 1. 克隆项目

```bash
git clone <your-repo>
cd blockchaindevep2
```

### 2. 配置环境变量

复制并编辑 `.env` 文件：

```bash
cp .env.example .env
```

填写以下必需字段：

```env
# 网络配置
RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY

# 合约地址 (部署后填写)
LOTTERY_CONTRACT=0xYourLotteryAddress
DICE_CONTRACT=0xYourDiceAddress
TOKEN_CONTRACT=0xYourTokenAddress

# VRF 配置
SUBSCRIPTION_ID=your_subscription_id
```

### 3. 安装依赖

**后端:**
```bash
cd backend
npm install
```

**前端:**
```bash
cd ../frontend
npm install
```

### 4. 启动开发服务器

**后端** (终端 1):
```bash
cd backend
npm run dev
```

**前端** (终端 2):
```bash
cd frontend
npm start
```

访问 http://localhost:3000

---

## Docker 部署

### 方式一: 使用启动脚本

**Linux/Mac:**
```bash
chmod +x start.sh
./start.sh
```

**Windows:**
```bash
start.bat
```

### 方式二: 手动 Docker Compose

```bash
# 构建并启动
docker-compose up --build -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 重启服务
docker-compose restart
```

### 服务端口

| 服务 | 端口 | 说明 |
|------|------|------|
| Frontend | 3000 | React 应用 |
| Backend | 3001 | REST API |
| MongoDB | 27017 | 数据库 |

---

## 使用指南

### 连接钱包

1. 安装 MetaMask
2. 切换到 Sepolia 测试网
3. 点击 "Connect Wallet"
4. 批准连接请求

### 玩彩票游戏

1. 导航到 "Lottery" 页面
2. 选择购买票数
3. 点击 "Buy Tickets" 并确认交易
4. 等待轮次结束
5. 任何人可以点击 "Draw Winner" 开奖
6. Chainlink VRF 将在 1-2 分钟内返回结果

### 玩骰子游戏

1. 导航到 "Dice Game" 页面
2. 选择数字 (1-6)
3. 输入投注金额
4. 点击 "Place Bet" 并确认交易
5. 等待 30 秒到 2 分钟
6. 刷新查看结果

### 查看统计

- **Home 页面**: 平台总体统计
- **Profile 页面**: 个人游戏历史和统计

---

## API 文档

### 基础 URL

```
http://localhost:3001/api
```

### 端点

#### 彩票

```
GET  /lottery/status           # 当前轮次状态
GET  /lottery/history?limit=10 # 历史记录
GET  /lottery/player/:address  # 玩家票数
```

#### 骰子

```
GET  /dice/status              # 游戏状态
GET  /dice/history/:address    # 玩家历史
GET  /dice/player/:address     # 玩家统计
```

#### 用户

```
GET  /user/:address/stats      # 用户完整统计
```

#### 统计

```
GET  /stats/overview           # 平台总览
GET  /stats/network            # 网络信息
```

---

## 故障排查

### 合约交互失败

**症状**: 交易失败或无响应

**可能原因和解决方案**:

1. **网络不匹配**
   - 确保 MetaMask 在 Sepolia 网络
   - 检查 `.env` 中的 `CHAIN_ID=11155111`

2. **合约地址错误**
   - 验证 `.env` 中的合约地址
   - 在 Etherscan 上确认合约已部署

3. **Gas 不足**
   - 获取更多测试 ETH
   - 增加 gas limit

### VRF 请求不返回

**症状**: 游戏结果长时间待定

**解决方案**:

1. 检查 VRF Subscription 余额
   - 访问 https://vrf.chain.link/
   - 确保有足够 LINK

2. 确认合约已添加为消费者
   - 在 VRF 控制台检查消费者列表

3. 查看合约事件
   - 在 Sepolia Etherscan 查看合约日志

### Docker 服务无法启动

**症状**: `docker-compose up` 失败

**解决方案**:

1. 检查端口占用
   ```bash
   # Windows
   netstat -ano | findstr "3000"
   netstat -ano | findstr "3001"
   
   # Linux/Mac
   lsof -i :3000
   lsof -i :3001
   ```

2. 清理 Docker 缓存
   ```bash
   docker-compose down -v
   docker system prune -a
   docker-compose up --build
   ```

3. 查看服务日志
   ```bash
   docker-compose logs backend
   docker-compose logs frontend
   ```

### 前端无法连接后端

**症状**: API 请求失败

**解决方案**:

1. 检查后端运行
   ```bash
   curl http://localhost:3001/api/health
   ```

2. 验证环境变量
   - 确保 `REACT_APP_API_URL` 正确
   - Docker 中使用 `http://localhost:3001`

3. 检查 CORS 设置
   - 后端应允许前端域名

### MetaMask 连接问题

**症状**: 无法连接钱包

**解决方案**:

1. 刷新页面
2. 在 MetaMask 中断开并重新连接
3. 清除浏览器缓存
4. 确保 MetaMask 已解锁

---

## 性能优化

### 前端

- 使用生产构建: `npm run build`
- 启用 gzip 压缩 (已在 nginx 配置)
- CDN 部署静态资源

### 后端

- 启用 API 响应缓存
- 使用 Redis 缓存热数据
- 数据库索引优化

### 区块链

- 批量处理交易
- 优化 gas 使用
- 使用事件监听代替轮询

---

## 安全最佳实践

1. **私钥管理**
   - 永不提交 `.env` 到版本控制
   - 使用环境变量注入

2. **合约安全**
   - 主网部署前进行审计
   - 使用 timelock 和多签钱包

3. **API 安全**
   - 生产环境启用 rate limiting
   - 使用 HTTPS
   - 验证用户输入

4. **前端安全**
   - 验证所有交易参数
   - 显示交易详情供用户确认
   - 实现请求签名验证

---

## 监控和日志

### 查看 Docker 日志

```bash
# 所有服务
docker-compose logs -f

# 特定服务
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 监控合约事件

在 [Sepolia Etherscan](https://sepolia.etherscan.io/) 查看：
- 交易历史
- 事件日志
- 合约余额

### 健康检查

```bash
# API 健康
curl http://localhost:3001/api/health

# 网络状态
curl http://localhost:3001/api/stats/network
```

---

## 升级指南

### 更新合约

1. 部署新合约版本
2. 更新 `.env` 中的地址
3. 重启服务

### 更新前后端

```bash
# 拉取最新代码
git pull

# 重建 Docker 镜像
docker-compose up --build -d
```

---

## 生产部署建议

### 主网部署前

- [ ] 完整的合约安全审计
- [ ] 压力测试
- [ ] 灾难恢复计划
- [ ] 监控和告警系统
- [ ] 备份策略

### 基础设施

- 使用云服务 (AWS, GCP, Azure)
- CDN 加速前端
- 负载均衡
- 数据库主从复制
- 自动扩容

### 合约升级策略

- 使用代理模式 (Proxy Pattern)
- 实现 Timelock
- 多签钱包控制
- 紧急暂停机制

---

## 维护检查清单

### 每日

- [ ] 检查 VRF Subscription 余额
- [ ] 监控合约余额
- [ ] 查看错误日志
- [ ] 验证服务健康

### 每周

- [ ] 备份数据库
- [ ] 审查异常交易
- [ ] 更新依赖包
- [ ] 性能分析

### 每月

- [ ] 安全审计
- [ ] 代码审查
- [ ] 用户反馈分析
- [ ] 功能优化

---

## 获取帮助

- 查看 [README.md](README.md)
- 阅读 [contracts/DEPLOYMENT.md](contracts/DEPLOYMENT.md)
- 提交 GitHub Issue
- 查阅 [Chainlink VRF 文档](https://docs.chain.link/vrf/v2/introduction)

---

## 许可证

MIT License - 详见 LICENSE 文件
