import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5006/mraniket404/api';

console.log('🔧 API Base URL:', API_URL);

const api = axios.create({
    baseURL: API_URL,
    timeout: 180000, // 3 minutes timeout
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor with better error handling
api.interceptors.response.use(
    (response) => {
        console.log(`📥 ${response.config.url} -> ${response.status}`);
        return response;
    },
    (error) => {
        if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
            console.error('❌ Request timeout! Server taking too long.');
            return Promise.reject(new Error('Request timeout: Server is taking too long to respond'));
        }
        if (error.response) {
            console.error(`❌ API Error: ${error.response.status}`, error.response.data);
        } else if (error.request) {
            console.error('❌ Network Error: No response received. Check if backend is running.');
        } else {
            console.error('❌ Error:', error.message);
        }
        return Promise.reject(error);
    }
);

export default api;