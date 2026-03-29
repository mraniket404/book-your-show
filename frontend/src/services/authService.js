import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5006/mraniket404/api';

console.log('🔧 API URL:', API_URL);

const api = axios.create({
    baseURL: API_URL,
    timeout: 60000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Request interceptor for logging
api.interceptors.request.use(
    (config) => {
        console.log(`📤 [API Request] ${config.method.toUpperCase()} ${config.url}`);
        if (config.data) {
            console.log(`📦 Request Data:`, config.data);
        }
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

// Response interceptor for logging
api.interceptors.response.use(
    (response) => {
        console.log(`📥 [API Response] ${response.config.url} -> ${response.status}`);
        return response;
    },
    (error) => {
        console.error('Response Error:', error.response?.status, error.response?.data);
        if (error.code === 'ECONNABORTED') {
            console.error('Request timeout!');
            error.response = {
                data: { message: 'Request timeout. Please try again.' }
            };
        }
        return Promise.reject(error);
    }
);

const authService = {
    register: async (userData) => {
        try {
            console.log('📝 Registering user:', userData.email);
            const response = await api.post('/auth/register', userData);
            return response;
        } catch (error) {
            console.error('Register API Error:', error.response?.data || error.message);
            throw error;
        }
    },
    
    login: async (email, password) => {
        try {
            console.log('🔐 Logging in:', email);
            const response = await api.post('/auth/login', { email, password });
            return response;
        } catch (error) {
            console.error('Login API Error:', error.response?.data || error.message);
            throw error;
        }
    },
    
    getMe: async () => {
        try {
            const response = await api.get('/auth/me');
            return response;
        } catch (error) {
            console.error('Get Me API Error:', error.response?.data || error.message);
            throw error;
        }
    },
    
    updateProfile: async (data) => {
        try {
            const response = await api.put('/auth/profile', data);
            return response;
        } catch (error) {
            console.error('Update Profile Error:', error.response?.data || error.message);
            throw error;
        }
    }
};

export default authService;