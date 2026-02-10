@echo off
REM 区块链游戏平台 - Windows 启动脚本

echo 🎲 Starting Blockchain Gaming Platform...

REM 检查 .env 文件
if not exist .env (
    echo ⚠️  .env file not found. Copying from .env.example...
    copy .env.example .env
    echo ⚠️  Please edit .env file with your configuration before continuing.
    echo Required: RPC_URL, LOTTERY_CONTRACT, DICE_CONTRACT
    exit /b 1
)

echo ✅ Configuration loaded

REM 构建和启动服务
echo.
echo 🐋 Building and starting Docker containers...
docker-compose up --build -d

REM 等待服务启动
echo.
echo ⏳ Waiting for services to be healthy...
timeout /t 10 /nobreak >nul

REM 检查服务状态
echo.
echo 📊 Service Status:
docker-compose ps

echo.
echo ✅ Platform started successfully!
echo.
echo 🌐 Access points:
echo    Frontend:  http://localhost:3000
echo    API:       http://localhost:3001
echo    MongoDB:   localhost:27017
echo.
echo 📝 Useful commands:
echo    View logs:     docker-compose logs -f
echo    Stop:          docker-compose down
echo    Restart:       docker-compose restart
echo    Rebuild:       docker-compose up --build -d
echo.
pause
