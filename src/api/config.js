import axios from 'axios';

// ----------------------------------------------------
// ⚠️ IMPORTANT: CHOOSE THE CORRECT IP ⚠️
// ----------------------------------------------------

// OPTION 1: Android Emulator
const BASE_URL = 'http://10.0.2.2:8000'; 

// OPTION 2: Physical Phone (You MUST find your PC IP in cmd -> ipconfig)
// const BASE_URL = 'http://192.168.1.5:8000'; 

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, 
});

export default api;