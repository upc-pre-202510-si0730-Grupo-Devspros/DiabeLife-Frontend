import axios from 'axios';

export class ApiClient {
    constructor(baseURL) {
        this.client = axios.create({
            // Usar proxy local en lugar de URL directa para evitar CORS
            baseURL: baseURL || '/api/v1',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        // Interceptor para agregar token de autenticación automáticamente
        this.client.interceptors.request.use((config) => {
            const token = localStorage.getItem('token');
            if (token && token !== 'fake-jwt-token') {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        }, (error) => {
            return Promise.reject(error);
        });
        
        // Interceptor para manejo de respuestas y errores
        this.client.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/auth/login';
                }
                
                return Promise.reject(error);
            }
        );
    }

    async get(url) {
        const response = await this.client.get(url);
        return response.data;
    }

    async post(url, data) {
        const response = await this.client.post(url, data);
        return response.data;
    }

    async put(url, data) {
        const response = await this.client.put(url, data);
        return response.data;
    }

    async patch(url, data) {
        const response = await this.client.patch(url, data);
        return response.data;
    }

    async delete(url) {
        const response = await this.client.delete(url);
        return response.data;
    }
}
