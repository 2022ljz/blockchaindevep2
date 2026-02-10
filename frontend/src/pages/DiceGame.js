import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getContract, parseEther } from '../utils/web3';
import { getDiceStatus, getDiceHistory } from '../utils/api';
import { DICE_ABI, DICE_ADDRESS } from '../config/contracts';

function DiceGame({ account }) {
  const [status, setStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [betAmount, setBetAmount] = useState('0.01');
  const [betting, setBetting] = useState(false);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // 🔧 改为 5 秒刷新一次（从 15 秒）
    return () => clearInterval(interval);
  }, [account]);

  const loadData = async () => {
    try {
      const statusRes = await getDiceStatus();
      if (statusRes.success) setStatus(statusRes.data);

      if (account) {
        const historyRes = await getDiceHistory(account, 10);
        if (historyRes.success) setHistory(historyRes.data);
      }
    } catch (error) {
      console.error('Error loading dice data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceBet = async () => {
    if (!account) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!selectedNumber) {
      toast.error('Please select a number');
      return;
    }

    if (parseFloat(betAmount) < parseFloat(status.minBet) || 
        parseFloat(betAmount) > parseFloat(status.maxBet)) {
      toast.error(`Bet must be between ${status.minBet} and ${status.maxBet} ETH`);
      return;
    }

    setBetting(true);

    try {
      const contract = await getContract(DICE_ADDRESS, DICE_ABI);
      const value = parseEther(betAmount);
      
      const tx = await contract.placeBet(selectedNumber, { value });
      toast.info('Bet placed! Waiting for result...');
      
      await tx.wait();
      toast.success('Bet confirmed! Result will arrive shortly from Chainlink VRF 🎲');
      
      setSelectedNumber(null);
      loadData(); // 🔧 立即刷新
    } catch (error) {
      console.error('Error placing bet:', error);
      toast.error(error.reason || 'Failed to place bet');
    } finally {
      setBetting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        Loading dice game...
      </div>
    );
  }

  return (
    <div>
      <div className="card">
        <h1 className="card-header">🎲 Dice Game</h1>
        <p style={{ marginBottom: '20px' }}>
          Choose a number from 1-6. If you guess correctly, win {status?.winMultiplier}x your bet!
        </p>

        {status && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{status.totalGamesPlayed}</div>
              <div className="stat-label">Total Games</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{status.activeBets}</div>
              <div className="stat-label">Active Bets</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{status.winMultiplier}x</div>
              <div className="stat-label">Win Multiplier</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{parseFloat(status.contractBalance).toFixed(2)} ETH</div>
              <div className="stat-label">Pool</div>
            </div>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Select Your Number</label>
          <div className="dice-buttons">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <button
                key={num}
                className={`dice-btn ${selectedNumber === num ? 'selected' : ''}`}
                onClick={() => setSelectedNumber(num)}
                disabled={betting}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            Bet Amount (Min: {status?.minBet} ETH, Max: {status?.maxBet} ETH)
          </label>
          <input
            type="number"
            className="form-input"
            value={betAmount}
            onChange={(e) => setBetAmount(e.target.value)}
            step="0.001"
            min={status?.minBet}
            max={status?.maxBet}
            disabled={betting}
          />
          {selectedNumber && (
            <div style={{ marginTop: '10px', fontSize: '16px' }}>
              Potential Win: {(parseFloat(betAmount) * status.winMultiplier * 0.95).toFixed(4)} ETH
              <span style={{ opacity: 0.7, marginLeft: '10px' }}>
                (5% fee included)
              </span>
            </div>
          )}
        </div>

        <button
          className="btn"
          onClick={handlePlaceBet}
          disabled={!account || !selectedNumber || betting}
        >
          {betting ? 'Placing Bet...' : 'Place Bet 🎲'}
        </button>
      </div>

      {account && (
        <div className="card">
          <h2 className="card-header">Your Recent Bets</h2>
          {history.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Your Number</th>
                  <th>Result</th>
                  <th>Bet</th>
                  <th>Payout</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((bet, index) => (
                  <tr key={index}>
                    <td>{bet.chosenNumber}</td>
                    <td>
                      {bet.settled 
                        ? bet.rolledNumber 
                        : '⏳'}
                    </td>
                    <td>{parseFloat(bet.amount).toFixed(4)} ETH</td>
                    <td>
                      {bet.won 
                        ? `${parseFloat(bet.payout).toFixed(4)} ETH` 
                        : bet.settled ? '-' : '⏳'}
                    </td>
                    <td>
                      {!bet.settled && '⏳ Pending'}
                      {bet.settled && bet.won && '🎉 Won!'}
                      {bet.settled && !bet.won && '❌ Lost'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="loading">No bets yet. Place your first bet!</div>
          )}
        </div>
      )}
    </div>
  );
}

export default DiceGame;
