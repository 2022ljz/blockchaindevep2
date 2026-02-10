import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Header from './components/Header';
import Home from './pages/Home';
import Lottery from './pages/Lottery';
import DiceGame from './pages/DiceGame';
import Profile from './pages/Profile';
import { connectWallet, getCurrentAccount } from './utils/web3';

function App() {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);

  useEffect(() => {
    checkConnection();
    
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  const checkConnection = async () => {
    const currentAccount = await getCurrentAccount();
    if (currentAccount) {
      setAccount(currentAccount);
      if (window.ethereum) {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        setChainId(chainId);
      }
    }
  };

  const handleConnect = async () => {
    const account = await connectWallet();
    if (account) {
      setAccount(account);
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      setChainId(chainId);
    }
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      setAccount(null);
    } else {
      setAccount(accounts[0]);
    }
  };

  const handleChainChanged = () => {
    window.location.reload();
  };

  return (
    <Router>
      <div className="App">
        <Header 
          account={account} 
          chainId={chainId}
          onConnect={handleConnect} 
        />
        <div className="container">
          <Routes>
            <Route path="/" element={<Home account={account} />} />
            <Route path="/lottery" element={<Lottery account={account} />} />
            <Route path="/dice" element={<DiceGame account={account} />} />
            <Route path="/profile" element={<Profile account={account} />} />
          </Routes>
        </div>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </Router>
  );
}

export default App;
