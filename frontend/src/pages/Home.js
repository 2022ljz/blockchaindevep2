import React, { useState, useEffect } from 'react';
import { getOverviewStats } from '../utils/api';

function Home({ account }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    // 🔧 新增：每 5 秒自动刷新统计数据，保持实时同步
    const interval = setInterval(loadStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const response = await getOverviewStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        Loading platform stats...
      </div>
    );
  }

  return (
    <div>
      <div className="card">
        <h1 className="card-header">Welcome to Blockchain Gaming Platform</h1>
        <p style={{ fontSize: '18px', lineHeight: '1.6', marginBottom: '20px' }}>
          Experience provably fair gaming powered by <strong>Chainlink VRF</strong>. 
          Every random number is verifiable on-chain, ensuring complete transparency and fairness.
        </p>
        
        {!account && (
          <div className="alert alert-info">
            👆 Connect your wallet to start playing!
          </div>
        )}
      </div>

      <div className="stats-grid">
        {stats?.lottery && (
          <>
            <div className="stat-card">
              <div className="stat-value">Round #{stats.lottery.currentRound}</div>
              <div className="stat-label">Current Lottery</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.lottery.prizePool} ETH</div>
              <div className="stat-label">Prize Pool</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.lottery.totalPlayers}</div>
              <div className="stat-label">Players</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.lottery.totalTickets}</div>
              <div className="stat-label">Tickets Sold</div>
            </div>
          </>
        )}
      </div>

      <div className="stats-grid">
        {stats?.dice && (
          <>
            <div className="stat-card">
              <div className="stat-value">{stats.dice.totalGames}</div>
              <div className="stat-label">Total Dice Games</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.dice.activeGames}</div>
              <div className="stat-label">Active Bets</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{parseFloat(stats.dice.totalWinnings).toFixed(4)} ETH</div>
              <div className="stat-label">Total Winnings</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{parseFloat(stats.dice.contractBalance).toFixed(4)} ETH</div>
              <div className="stat-label">Contract Balance</div>
            </div>
          </>
        )}
      </div>

      <div className="card">
        <h2 className="card-header">How It Works</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div>
            <h3>🎰 Lottery</h3>
            <p>Buy tickets for the current round. When the round ends, a winner is randomly selected using Chainlink VRF. The winner receives the prize pool (minus platform fee).</p>
          </div>
          <div>
            <h3>🎲 Dice Game</h3>
            <p>Choose a number from 1-6 and place your bet. If the dice lands on your number, you win 6x your bet (minus platform fee). Results are generated using Chainlink VRF.</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="card-header">Why Blockchain Gaming?</h2>
        <ul style={{ fontSize: '16px', lineHeight: '1.8', paddingLeft: '20px' }}>
          <li><strong>Provably Fair:</strong> All random numbers are generated on-chain and can be verified</li>
          <li><strong>Transparent:</strong> All game logic is open-source and auditable</li>
          <li><strong>Non-Custodial:</strong> You maintain full control of your funds</li>
          <li><strong>Instant Settlement:</strong> Winnings are paid out automatically via smart contracts</li>
          <li><strong>No Trust Required:</strong> No central authority can manipulate outcomes</li>
        </ul>
      </div>
    </div>
  );
}

export default Home;
