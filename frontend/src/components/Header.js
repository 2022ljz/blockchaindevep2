import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { formatAddress } from '../utils/web3';

function Header({ account, chainId, onConnect }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const getNetworkName = (chainId) => {
    const networks = {
      '0xaa36a7': 'Sepolia',
      '0x1': 'Ethereum',
      '0x5': 'Goerli',
    };
    return networks[chainId] || 'Unknown';
  };

  return (
    <div className="header">
      <div className="header-content">
        <div className="logo">🎲 Blockchain Gaming</div>
        
        <nav className="nav">
          <button 
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
            onClick={() => navigate('/')}
          >
            Home
          </button>
          <button 
            className={`nav-link ${isActive('/lottery') ? 'active' : ''}`}
            onClick={() => navigate('/lottery')}
          >
            Lottery
          </button>
          <button 
            className={`nav-link ${isActive('/dice') ? 'active' : ''}`}
            onClick={() => navigate('/dice')}
          >
            Dice Game
          </button>
          {account && (
            <button 
              className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
              onClick={() => navigate('/profile')}
            >
              Profile
            </button>
          )}
        </nav>

        <div className="wallet-section">
          {account ? (
            <>
              <div className="wallet-info">
                {getNetworkName(chainId)}
              </div>
              <div className="wallet-info">
                {formatAddress(account)}
              </div>
            </>
          ) : (
            <button className="btn" onClick={onConnect}>
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Header;
