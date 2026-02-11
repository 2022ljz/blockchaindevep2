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
      let errorMsg = 'Failed to purchase tickets';
      if (error.reason) {
        errorMsg = error.reason;
      } else if (error.message) {
        errorMsg = error.message.includes('user rejected') 
          ? 'Transaction rejected by user' 
          : error.message.substring(0, 100);
      }
      toast.error(errorMsg);
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
      let errorMsg = 'Failed to draw winner';
      if (error.reason) {
        errorMsg = error.reason;
      } else if (error.message) {
        if (error.message.includes('user rejected')) {
          errorMsg = 'Transaction rejected by user';
        } else if (error.message.includes('InvalidConsumer')) {
          errorMsg = '⚠️ Contract not added to VRF Subscription! Please add contract as Consumer at vrf.chain.link';
        } else {
          errorMsg = error.message.substring(0, 150);
        }
      }
      toast.error(errorMsg, { autoClose: 8000 });
    }
  };

  const handleClaimPrize = async (roundId) => {
    if (!account) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      const contract = await getContract(LOTTERY_ADDRESS, LOTTERY_ABI);
      const tx = await contract.claimPrize(roundId);
      
      toast.info('Claiming your prize...');
      await tx.wait();
      toast.success('🎉 Prize claimed successfully!');
      
      loadData();
    } catch (error) {
      console.error('Error claiming prize:', error);
      let errorMsg = 'Failed to claim prize';
      if (error.reason) {
        errorMsg = error.reason;
      } else if (error.message) {
        if (error.message.includes('user rejected')) {
          errorMsg = 'Transaction rejected by user';
        } else if (error.message.includes('Not the winner')) {
          errorMsg = 'You are not the winner of this round';
        } else if (error.message.includes('already claimed')) {
          errorMsg = 'Prize has already been claimed';
        } else {
          errorMsg = error.message.substring(0, 150);
        }
      }
      toast.error(errorMsg);
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

            {/* 买票界面 - 根据轮次状态显示不同提示 */}
            <div className="form-group">
              <label className="form-label">Number of Tickets</label>
              
              {/* 情况1: 轮次结束 && 有票 && 未开奖 -> 必须先开奖 */}
              {(status.startTime + status.duration - currentTime) <= 0 && status.totalTickets > 0 && !status.drawn && (
                <div className="alert alert-warning" style={{ marginBottom: '10px', padding: '12px', backgroundColor: '#fff3cd', borderRadius: '5px', border: '1px solid #ffc107', color: '#856404' }}>
                  ⚠️ Current round ended. Please draw winner first before buying new tickets!
                </div>
              )}
              
              {/* 情况2: 轮次结束 && (无票 或 已开奖) -> 买票会开启新轮次 */}
              {(status.startTime + status.duration - currentTime) <= 0 && (status.totalTickets === 0 || status.drawn) && status.winner !== '0x0000000000000000000000000000000000000000' && (
                <div className="alert alert-info" style={{ marginBottom: '10px', padding: '12px', backgroundColor: '#e3f2fd', borderRadius: '5px', color: '#0c5460' }}>
                  ℹ️ Previous round completed. Buying tickets will start Round #{parseInt(status.currentRound) + 1}!
                </div>
              )}
              
              {/* 情况3: 轮次结束 && 无票 && 未开奖 -> 直接开启新轮次 */}
              {(status.startTime + status.duration - currentTime) <= 0 && status.totalTickets === 0 && !status.drawn && (
                <div className="alert alert-info" style={{ marginBottom: '10px', padding: '12px', backgroundColor: '#e3f2fd', borderRadius: '5px', color: '#0c5460' }}>
                  ℹ️ No tickets in previous round. Buying tickets will start a new round!
                </div>
              )}
              
              <input
                type="number"
                className="form-input"
                value={ticketCount}
                onChange={(e) => setTicketCount(parseInt(e.target.value) || 1)}
                min="1"
                max="100"
                disabled={!account || purchasing || ((status.startTime + status.duration - currentTime) <= 0 && status.totalTickets > 0 && !status.drawn)}
              />
              <div style={{ marginTop: '10px' }}>
                Total Cost: {(parseFloat(status.ticketPrice) * ticketCount).toFixed(4)} ETH
              </div>
              <button
                className="btn"
                onClick={handleBuyTickets}
                disabled={!account || purchasing || ((status.startTime + status.duration - currentTime) <= 0 && status.totalTickets > 0 && !status.drawn)}
                style={{ marginTop: '15px' }}
              >
                {purchasing ? 'Purchasing...' : 'Buy Tickets'}
              </button>
            </div>

            {/* 抽奖按钮 - 仅在轮次结束且有票时显示 */}
            {(status.startTime + status.duration - currentTime) <= 0 && status.totalTickets > 0 && (
              <div style={{ marginTop: '20px' }}>
                {!status.drawn ? (
                  <button
                    className="btn"
                    onClick={handleDraw}
                    disabled={!account}
                  >
                    Draw Winner 🎉
                  </button>
                ) : status.winner === '0x0000000000000000000000000000000000000000' ? (
                  <div className="alert alert-info">
                    Drawing in progress... Please wait for Chainlink VRF to respond.
                    <div style={{ fontSize: '14px', marginTop: '10px', opacity: 0.8 }}>
                      This usually takes 30-120 seconds. The page will auto-refresh.
                    </div>
                  </div>
                ) : (
                  <div className="alert alert-success" style={{ backgroundColor: '#d4edda', color: '#155724' }}>
                    ✅ Winner selected! Round #{status.currentRound} is complete.
                    <div style={{ marginTop: '5px' }}>Winner: {status.winner.slice(0, 10)}...{status.winner.slice(-8)}</div>
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
                <th>Action</th>
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
                  <td>
                    {round.winner !== '0x0000000000000000000000000000000000000000'
                      ? (round.prizeClaimed ? '💰 Claimed' : '✅ Complete')
                      : round.drawn
                      ? '🔄 Drawing...'
                      : '⌛ Pending'}
                  </td>
                  <td>
                    {round.winner !== '0x0000000000000000000000000000000000000000' 
                      && !round.prizeClaimed 
                      && round.winner.toLowerCase() === account?.toLowerCase() ? (
                      <button
                        className="btn"
                        onClick={() => handleClaimPrize(round.roundId)}
                        style={{ padding: '5px 15px', fontSize: '14px' }}
                      >
                        Claim Prize 🎁
                      </button>
                    ) : '-'}
                  </td>
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
