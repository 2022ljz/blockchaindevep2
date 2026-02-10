import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 10000,
});

// Lottery API
export const getLotteryStatus = async () => {
  const response = await api.get('/lottery/status');
  return response.data;
};

export const getLotteryHistory = async (limit = 10) => {
  const response = await api.get(`/lottery/history?limit=${limit}`);
  return response.data;
};

export const getPlayerLotteryTickets = async (address) => {
  const response = await api.get(`/lottery/player/${address}`);
  return response.data;
};

// Dice API
export const getDiceStatus = async () => {
  const response = await api.get('/dice/status');
  return response.data;
};

export const getDiceHistory = async (address, limit = 20) => {
  const response = await api.get(`/dice/history/${address}?limit=${limit}`);
  return response.data;
};

export const getPlayerDiceStats = async (address) => {
  const response = await api.get(`/dice/player/${address}`);
  return response.data;
};

// User API
export const getUserStats = async (address) => {
  const response = await api.get(`/user/${address}/stats`);
  return response.data;
};

// Stats API
export const getOverviewStats = async () => {
  const response = await api.get('/stats/overview');
  return response.data;
};

export const getNetworkStats = async () => {
  const response = await api.get('/stats/network');
  return response.data;
};

export default api;
