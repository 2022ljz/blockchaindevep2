import { ethers } from 'ethers';
import { toast } from 'react-toastify';

const EXPECTED_CHAIN_ID = process.env.REACT_APP_NETWORK_ID || '11155111'; // Sepolia

export const connectWallet = async () => {
  if (!window.ethereum) {
    toast.error('Please install MetaMask!');
    return null;
  }

  try {
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });
    
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    
    if (chainId !== `0x${parseInt(EXPECTED_CHAIN_ID).toString(16)}`) {
      await switchNetwork();
    }

    toast.success('Wallet connected!');
    return accounts[0];
  } catch (error) {
    console.error('Error connecting wallet:', error);
    toast.error('Failed to connect wallet');
    return null;
  }
};

export const getCurrentAccount = async () => {
  if (!window.ethereum) return null;

  try {
    const accounts = await window.ethereum.request({ 
      method: 'eth_accounts' 
    });
    return accounts[0] || null;
  } catch (error) {
    console.error('Error getting account:', error);
    return null;
  }
};

export const switchNetwork = async () => {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${parseInt(EXPECTED_CHAIN_ID).toString(16)}` }],
    });
  } catch (switchError) {
    // Chain not added, try to add it
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${parseInt(EXPECTED_CHAIN_ID).toString(16)}`,
            chainName: 'Sepolia Testnet',
            nativeCurrency: {
              name: 'ETH',
              symbol: 'ETH',
              decimals: 18
            },
            rpcUrls: ['https://sepolia.infura.io/v3/'],
            blockExplorerUrls: ['https://sepolia.etherscan.io/']
          }],
        });
      } catch (addError) {
        toast.error('Failed to add network');
      }
    }
  }
};

export const getProvider = () => {
  if (!window.ethereum) return null;
  return new ethers.BrowserProvider(window.ethereum);
};

export const getSigner = async () => {
  const provider = getProvider();
  if (!provider) return null;
  return await provider.getSigner();
};

export const getContract = async (address, abi) => {
  const signer = await getSigner();
  if (!signer) return null;
  return new ethers.Contract(address, abi, signer);
};

export const formatAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatEther = (value) => {
  return ethers.formatEther(value);
};

export const parseEther = (value) => {
  return ethers.parseEther(value.toString());
};
