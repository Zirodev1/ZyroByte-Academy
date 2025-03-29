// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
});

// Request interceptor
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('API Request:', {
        method: config.method,
        url: config.url,
        data: config.data,
        headers: config.headers
    });
    return config;
}, error => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
});

// Response interceptor
api.interceptors.response.use(
    response => {
        console.log('API Response Success:', {
            status: response.status,
            data: response.data,
            from: response.config.url
        });
        return response;
    },
    error => {
        console.error('API Response Error:', {
            message: error.message,
            response: error.response ? {
                status: error.response.status,
                data: error.response.data
            } : 'No response',
            config: error.config ? {
                url: error.config.url,
                method: error.config.method,
                data: error.config.data
            } : 'No config'
        });
        return Promise.reject(error);
    }
);

export default api;
