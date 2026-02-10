import React, { useState, useEffect } from 'react';
import { getUserStats } from '../utils/api';

function Profile({ account }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (account) {
      loadStats();
    }
  }, [account]);

  const loadStats = async () => {
    try {
      const response = await getUserStats(account);
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error loading user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!account) {
    return (
      <div className="card">
        <h1 className="card-header">Profile</h1>
        <div className="alert alert-info">
          Please connect your wallet to view your profile
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        Loading profile...
      </div>
    );
  }

  return (
    <div>
      <div className="card">
        <h1 className="card-header">👤 Your Profile</h1>
        <div className="form-group">
          <label className="form-label">Wallet Address</label>
          <div style={{ 
            padding: '10px', 
            background: '#f0f0f0', 
            borderRadius: '8px',
            fontFamily: 'monospace',
            wordBreak: 'break-all'
          }}>
            {account}
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="card-header">🎰 Lottery Stats</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats?.lottery?.currentTickets || 0}</div>
            <div className="stat-label">Current Tickets</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats?.lottery?.ticketsPurchased || 0}</div>
            <div className="stat-label">Total Tickets</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats?.lottery?.roundsParticipated || 0}</div>
            <div className="stat-label">Rounds Joined</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats?.lottery?.wins || 0}</div>
            <div className="stat-label">Wins</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="card-header">🎲 Dice Game Stats</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats?.dice?.totalBetsCount || 0}</div>
            <div className="stat-label">Total Bets</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats?.dice?.pendingBets || 0}</div>
            <div className="stat-label">Pending Bets</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats?.dice?.wins || 0}</div>
            <div className="stat-label">Wins</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats?.dice?.losses || 0}</div>
            <div className="stat-label">Losses</div>
          </div>
        </div>
        
        {stats?.dice?.totalBetsCount > 0 && (
          <div style={{ marginTop: '20px' }}>
            <div className="form-group">
              <label className="form-label">Win Rate</label>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                {((stats.dice.wins / stats.dice.totalBetsCount) * 100).toFixed(2)}%
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Total Won</label>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                {stats.dice.totalWon || '0'} ETH
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
