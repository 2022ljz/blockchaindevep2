# 常用命令速查表

## 🚀 快速启动

### Docker 方式

```bash
# Windows
start.bat

# Linux/Mac
chmod +x start.sh
./start.sh
```

### 本地开发方式

```bash
# 后端 (终端 1)
cd backend
npm install
npm run dev

# 前端 (终端 2)
cd frontend
npm install
npm start
```

---

## 🐋 Docker 命令

### 基础操作

```bash
# 构建并启动所有服务
docker-compose up --build -d

# 启动服务 (不重新构建)
docker-compose up -d

# 停止所有服务
docker-compose down

# 停止并删除数据卷
docker-compose down -v

# 重启服务
docker-compose restart

# 重启特定服务
docker-compose restart backend
docker-compose restart frontend
```

### 查看状态和日志

```bash
# 查看所有服务状态
docker-compose ps

# 查看所有日志
docker-compose logs

# 实时查看日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs backend
docker-compose logs -f frontend

# 查看最近 100 行日志
docker-compose logs --tail=100
```

### 进入容器

```bash
# 进入后端容器
docker-compose exec backend sh

# 进入前端容器
docker-compose exec frontend sh

# 进入 MongoDB 容器
docker-compose exec mongo mongosh
```

### 清理和维护

```bash
# 清理未使用的镜像
docker system prune

# 清理所有未使用的资源
docker system prune -a

# 查看磁盘使用
docker system df

# 删除所有停止的容器
docker container prune
```

---

## 📦 NPM 命令

### 后端

```bash
cd backend

# 安装依赖
npm install

# 开发模式 (带热重载)
npm run dev

# 生产模式
npm start

# 运行测试
npm test
```

### 前端

```bash
cd frontend

# 安装依赖
npm install

# 开发模式
npm start

# 构建生产版本
npm run build

# 运行测试
npm test
```

---

## 🔗 常用 API 请求

### 健康检查

```bash
# API 健康状态
curl http://localhost:3001/api/health

# 输出示例:
# {"status":"ok","timestamp":"2026-02-10T...","mongodb":"connected"}
```

### 彩票 API

```bash
# 获取当前轮次状态
curl http://localhost:3001/api/lottery/status

# 获取历史记录 (最近 10 轮)
curl http://localhost:3001/api/lottery/history?limit=10

# 获取玩家票数
curl http://localhost:3001/api/lottery/player/0xYourAddress
```

### 骰子游戏 API

```bash
# 获取游戏状态
curl http://localhost:3001/api/dice/status

# 获取玩家投注历史
curl http://localhost:3001/api/dice/history/0xYourAddress?limit=20

# 获取玩家统计
curl http://localhost:3001/api/dice/player/0xYourAddress
```

### 用户和统计 API

```bash
# 获取用户完整统计
curl http://localhost:3001/api/user/0xYourAddress/stats

# 获取平台总览
curl http://localhost:3001/api/stats/overview

# 获取网络信息
curl http://localhost:3001/api/stats/network
```

---

## 🌐 浏览器访问

```bash
# 前端应用
http://localhost:3000

# 后端 API
http://localhost:3001

# API 健康检查
http://localhost:3001/api/health

# API 文档 (如果启用了 Swagger)
http://localhost:3001/api-docs
```

---

## 🔧 环境配置

### 创建配置文件

```bash
# 复制示例文件
cp .env.example .env

# 编辑配置 (Linux/Mac)
nano .env

# 编辑配置 (Windows)
notepad .env
```

### 必填配置项

```env
RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
LOTTERY_CONTRACT=0xYourLotteryAddress
DICE_CONTRACT=0xYourDiceAddress
SUBSCRIPTION_ID=your_vrf_subscription_id
```

---

## 🧪 测试命令

### 合约测试 (在 Remix 中)

```solidity
// 彩票合约
currentRound()          // 查看当前轮次
ticketPrice()           // 查看票价
getRoundInfo(1)         // 查看轮次 1 的信息

// 骰子合约
minBet()                // 最小投注
maxBet()                // 最大投注
getGameStats()          // 游戏统计
```

### 后端测试

```bash
cd backend

# 运行所有测试
npm test

# 运行特定测试文件
npm test -- services/web3.test.js

# 带覆盖率报告
npm test -- --coverage
```

### 前端测试

```bash
cd frontend

# 运行测试
npm test

# 交互模式
npm test -- --watch

# 覆盖率
npm test -- --coverage
```

---

## 📊 MongoDB 命令

### 连接数据库

```bash
# 使用 mongosh (MongoDB Shell)
mongosh mongodb://localhost:27017/game-platform

# 或通过 Docker
docker-compose exec mongo mongosh game-platform
```

### 常用查询

```javascript
// 查看所有集合
show collections

// 查看游戏事件
db.gameevents.find().limit(10)

// 查看用户统计
db.userstats.find()

// 统计记录数
db.gameevents.countDocuments()

// 清空集合 (谨慎!)
db.gameevents.deleteMany({})
```

---

## 🔍 调试命令

### 检查端口占用

```bash
# Windows
netstat -ano | findstr "3000"
netstat -ano | findstr "3001"
netstat -ano | findstr "27017"

# Linux/Mac
lsof -i :3000
lsof -i :3001
lsof -i :27017

# 杀死进程 (Windows)
taskkill /PID <PID> /F

# 杀死进程 (Linux/Mac)
kill -9 <PID>
```

### 网络诊断

```bash
# 测试后端连接
curl -I http://localhost:3001

# 测试前端
curl -I http://localhost:3000

# 测试 MongoDB
nc -zv localhost 27017
```

### Docker 网络

```bash
# 查看 Docker 网络
docker network ls

# 检查网络详情
docker network inspect blockchaindevep2_game-network

# 查看容器 IP
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' game-platform-backend
```

---

## 🛠️ 故障排除

### 重置 Docker 环境

```bash
# 1. 停止所有服务
docker-compose down -v

# 2. 删除镜像
docker-compose rm -f

# 3. 清理 Docker
docker system prune -a

# 4. 重新构建
docker-compose up --build
```

### 重置数据库

```bash
# 停止服务
docker-compose down

# 删除数据卷
docker volume rm blockchaindevep2_mongo_data

# 重启
docker-compose up -d
```

### 更新依赖

```bash
# 后端
cd backend
rm -rf node_modules package-lock.json
npm install

# 前端
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

## 📝 Git 命令

### 基础操作

```bash
# 克隆项目
git clone <repo-url>
cd blockchaindevep2

# 查看状态
git status

# 添加所有更改
git add .

# 提交
git commit -m "Your message"

# 推送
git push origin main
```

### 分支管理

```bash
# 创建新分支
git checkout -b feature/new-game

# 切换分支
git checkout main

# 合并分支
git merge feature/new-game

# 删除分支
git branch -d feature/new-game
```

---

## 🔐 安全命令

### 生成密钥

```bash
# 生成随机密钥 (Node.js)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 或使用 OpenSSL
openssl rand -hex 32
```

### 检查文件权限

```bash
# Linux/Mac
chmod 600 .env           # 仅所有者可读写
chmod +x start.sh        # 添加执行权限

# 查看权限
ls -la .env
```

---

## 📈 监控命令

### 实时监控

```bash
# 监控 Docker 容器资源使用
docker stats

# 只监控特定容器
docker stats game-platform-backend game-platform-frontend

# 监控日志
docker-compose logs -f --tail=50
```

### 性能分析

```bash
# Node.js 内存使用
docker-compose exec backend node -e "console.log(process.memoryUsage())"

# 容器资源限制
docker inspect game-platform-backend | grep -i memory
```

---

## 🚨 紧急命令

### 立即停止所有服务

```bash
docker-compose down
```

### 强制杀死容器

```bash
docker kill $(docker ps -q)
```

### 紧急备份数据库

```bash
# 导出 MongoDB 数据
docker-compose exec mongo mongodump --out /tmp/backup
docker cp game-platform-mongo:/tmp/backup ./mongodb-backup
```

### 恢复数据库

```bash
docker cp ./mongodb-backup game-platform-mongo:/tmp/backup
docker-compose exec mongo mongorestore /tmp/backup
```

---

## 📚 参考链接

| 工具 | 文档链接 |
|------|----------|
| Docker Compose | https://docs.docker.com/compose/ |
| Node.js | https://nodejs.org/docs/ |
| React | https://react.dev/ |
| Ethers.js | https://docs.ethers.org/ |
| MongoDB | https://docs.mongodb.com/ |
| Chainlink VRF | https://docs.chain.link/vrf |

---

## 💡 提示和技巧

### 快速重启服务

```bash
# 只重启后端 (代码更改后)
docker-compose restart backend

# 快速查看最新日志
docker-compose logs --tail=20 backend
```

### 日志过滤

```bash
# 只显示错误
docker-compose logs | grep -i error

# 只显示某个时间段
docker-compose logs --since 30m

# 保存日志到文件
docker-compose logs > app.log
```

### 性能优化

```bash
# 清理未使用的镜像 (释放空间)
docker image prune -a

# 限制日志大小 (在 docker-compose.yml 中)
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

---

**提示**: 将此文件加入书签以便快速查找常用命令！
