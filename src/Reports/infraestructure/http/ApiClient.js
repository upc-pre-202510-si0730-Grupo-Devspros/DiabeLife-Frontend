import axios from 'axios';

export class ApiClient {
    constructor(baseURL) {
        this.client = axios.create({
            // Usar proxy configurado en vite.config.js
            baseURL: baseURL || '/api/v1',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        // Interceptor para agregar token JWT automáticamente
        this.client.interceptors.request.use((config) => {
            // Buscar token en localStorage (puede estar como 'token' o 'authToken')
            const token = localStorage.getItem('token') || localStorage.getItem('authToken');
            
            if (token && token !== 'fake-jwt-token') {
                config.headers.Authorization = `Bearer ${token}`;
            }
            
            return config;
        }, (error) => {
            return Promise.reject(error);
        });
        
        // Interceptor para manejo de respuestas y errores del backend C#
        this.client.interceptors.response.use(
            (response) => response,
            (error) => {
                // Manejo específico de errores del backend C#
                if (error.response?.status === 401) {
                    console.error('Token JWT inválido o expirado');
                    localStorage.removeItem('token');
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('user');
                    // Redirigir al login
                    window.location.href = '/auth/login';
                } else if (error.response?.status === 404) {
                    console.warn('Recurso no encontrado o acceso denegado');
                } else if (error.response?.status === 400) {
                    console.error('Error en la solicitud:', error.response.data?.message);
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
