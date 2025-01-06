import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Handle specific HTTP status codes (401, 500)
    // if (error.response?.status === 401 || error.response?.status === 500 || error.response?.status === 403) {
    //   localStorage.removeItem('token');
    //   window.location.href = '/login';
    // }

    // // Handle ERR_CONNECTION_REFUSED or other network-level errors
    // if (error.code === 'ERR_CONNECTION_REFUSED') {
    //   localStorage.removeItem('token');
    //   window.location.href = '/login';
    //   // Optionally redirect the user or retry the request
    // } else if (!error.response) {
    //   // Handle other network errors (e.g., no internet)
    //   localStorage.removeItem('token');
    //   window.location.href = '/login';
    // }

    return Promise.reject(error);
  }
);

// Trading API endpoints
export const tradingAPI = {
  getBalance: () =>
    api.post('/balance/getBalance'),
  getCurrentPrices: (accountType) =>
    api.post('/market/getCurrentPrice', { accountType }),

  saveTPSL: (positionId, tp, sl) => api.post('/position/saveTPSL', { positionId, tp, sl }),

  getPositions: () =>
    api.post('/position/getPositions'),

  startTrade: (positionId) => api.post('/trade/startTrade', { positionId }),

  withdrawRequest: (asset, network, address, amount) =>
    api.post('/withdrawal/withdrawRequest', {
      asset,
      network,
      address,
      amount
    }),

  openFuturesPosition: (positionData) =>
    api.post('/position/openFuturesPosition', positionData),

  closeFuturesPosition: (positionId, reason) =>
    api.post('/position/closeFuturesPosition', { positionId, reason }),

  openSpotPosition: (positionData) =>
    api.post('/openSpotPosition', positionData),

  closeSpotPosition: (positionId) =>
    api.post('/position/closeSpotPosition', { positionId }),

  closePatialsPosition: (positionId, percent) =>
    api.post('/partialClosePosition', { positionId, percent })
};

// Wallet API endpoints
export const walletAPI = {
  getBalance: () =>
    api.post('/balance/getBalance'),

  updateBalance: (balanceData) =>
    api.post('/balance/updateBalance', balanceData),

  withdrawRequest: (withdrawData) =>
    api.post('/withdrawal/withdrawRequest', withdrawData)
};

// User API endpoints
export const userAPI = {
  login: (credentials) =>
    api.post('/auth/login', credentials),

  register: (userData) =>
    api.post('/auth/register', userData)
};

export default api;