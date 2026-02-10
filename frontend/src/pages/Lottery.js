import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getContract, parseEther, formatEther } from '../utils/web3';
import { getLotteryStatus, getLotteryHistory } from '../utils/api';
import { LOTTERY_ABI, LOTTERY_ADDRESS } from '../config/contracts';

function Lottery({ account }) {
  const [status, setStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ticketCount, setTicketCount] = useState(1);
  const [purchasing, setPurchasing] = useState(false);
  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000)); // 🔧 新增：实时时间

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // 🔧 改为 5 秒刷新一次（从 30 秒）
    return () => clearInterval(interval);
  }, []);

  // 🔧 新增：每秒更新时间，用于实时倒计时
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    try {
      const [statusRes, historyRes] = await Promise.all([
        getLotteryStatus(),
        getLotteryHistory(5)
      ]);
      
      if (statusRes.success) setStatus(statusRes.data);
      if (historyRes.success) setHistory(historyRes.data);
    } catch (error) {
      console.error('Error loading lottery data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyTickets = async () => {
    if (!account) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (ticketCount < 1) {
      toast.error('Please enter a valid number of tickets');
      return;
    }

    setPurchasing(true);

    try {
      const contract = await getContract(LOTTERY_ADDRESS, LOTTERY_ABI);
      const value = parseEther((parseFloat(status.ticketPrice) * ticketCount).toString());
      
      const tx = await contract.buyTickets(ticketCount, { value });
      toast.info('Transaction submitted. Waiting for confirmation...');
      
      await tx.wait();
      toast.success(`Successfully purchased ${ticketCount} ticket(s)!`);
      
      setTicketCount(1);
      loadData();
    } catch (error) {
      console.error('Error buying tickets:', error);
      toast.error(error.reason || 'Failed to purchase tickets');
    } finally {
      setPurchasing(false);
    }
  };

  const handleDraw = async () => {
    if (!account) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      const contract = await getContract(LOTTERY_ADDRESS, LOTTERY_ABI);
      const tx = await contract.drawWinner();
      
      toast.info('Drawing winner... This may take a few minutes.');
      await tx.wait();
      toast.success('Winner will be selected shortly by Chainlink VRF!');
      
      loadData(); // 🔧 立即刷新，不要等 1 分钟
    } catch (error) {
      console.error('Error drawing winner:', error);
      toast.error(error.reason || 'Failed to draw winner');
    }
  };

  const getRemainingTime = () => {
    if (!status) return '';
    const endTime = status.startTime + status.duration;
    const remaining = endTime - currentTime; // 🔧 改用实时的 currentTime
    
    if (remaining <= 0) return 'Ended - Ready to draw!';
    
    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    const seconds = remaining % 60;
    
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        Loading lottery...
      </div>
    );
  }

  return (
    <div>
      <div className="card">
        <h1 className="card-header">🎰 Lottery Game</h1>
        
        {status && (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">Round #{status.currentRound}</div>
                <div className="stat-label">Current Round</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{status.prizePool} ETH</div>
                <div className="stat-label">Prize Pool</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{status.totalTickets}</div>
                <div className="stat-label">Tickets Sold</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{status.playerCount}</div>
                <div className="stat-label">Players</div>
              </div>
            </div>

            <div className="form-group">
              <div className="stat-label">Time Remaining: {getRemainingTime()}</div>
              <div className="stat-label">Ticket Price: {status.ticketPrice} ETH</div>
            </div>

            {(status.startTime + status.duration - currentTime) > 0 ? (
              <div className="form-group">
                <label className="form-label">Number of Tickets</label>
                <input
                  type="number"
                  className="form-input"
                  value={ticketCount}
                  onChange={(e) => setTicketCount(parseInt(e.target.value) || 1)}
                  min="1"
                  max="100"
                  disabled={!account || purchasing}
                />
                <div style={{ marginTop: '10px' }}>
                  Total Cost: {(parseFloat(status.ticketPrice) * ticketCount).toFixed(4)} ETH
                </div>
                <button
                  className="btn"
                  onClick={handleBuyTickets}
                  disabled={!account || purchasing}
                  style={{ marginTop: '15px' }}
                >
                  {purchasing ? 'Purchasing...' : 'Buy Tickets'}
                </button>
              </div>
            ) : (
              <div>
                {!status.drawn && (
                  <button
                    className="btn"
                    onClick={handleDraw}
                    disabled={!account}
                  >
                    Draw Winner 🎉
                  </button>
                )}
                {status.drawn && (
                  <div className="alert alert-info">
                    Drawing in progress... Please wait for Chainlink VRF to respond.
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <div className="card">
        <h2 className="card-header">Recent Winners</h2>
        {history.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Round</th>
                <th>Prize Pool</th>
                <th>Tickets</th>
                <th>Winner</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((round) => (
                <tr key={round.roundId}>
                  <td>#{round.roundId}</td>
                  <td>{round.prizePool} ETH</td>
                  <td>{round.totalTickets}</td>
                  <td>
                    {round.winner !== '0x0000000000000000000000000000000000000000'
                      ? `${round.winner.slice(0, 6)}...${round.winner.slice(-4)}`
                      : 'N/A'}
                  </td>
                  <td>{round.drawn ? '✅ Complete' : '⏳ Pending'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="loading">No lottery history yet</div>
        )}
      </div>
    </div>
  );
}

export default Lottery;
