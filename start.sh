#!/bin/bash

# 区块链游戏平台 - 启动脚本

echo "🎲 Starting Blockchain Gaming Platform..."

# 检查 .env 文件
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Copying from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration before continuing."
    echo "Required: RPC_URL, LOTTERY_CONTRACT, DICE_CONTRACT"
    exit 1
fi

# 检查合约地址
source .env

if [ -z "$LOTTERY_CONTRACT" ] || [ -z "$DICE_CONTRACT" ]; then
    echo "❌ Error: Contract addresses not configured in .env"
    echo "Please deploy contracts and update .env file"
    exit 1
fi

echo "✅ Configuration loaded"
echo "📝 Contract addresses:"
echo "   Lottery: $LOTTERY_CONTRACT"
echo "   Dice: $DICE_CONTRACT"

# 构建和启动服务
echo ""
echo "🐋 Building and starting Docker containers..."
docker-compose up --build -d

# 等待服务启动
echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 10

# 检查服务状态
echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "✅ Platform started successfully!"
echo ""
echo "🌐 Access points:"
echo "   Frontend:  http://localhost:3000"
echo "   API:       http://localhost:3001"
echo "   MongoDB:   localhost:27017"
echo ""
echo "📝 Useful commands:"
echo "   View logs:     docker-compose logs -f"
echo "   Stop:          docker-compose down"
echo "   Restart:       docker-compose restart"
echo "   Rebuild:       docker-compose up --build -d"
echo ""
