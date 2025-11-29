// src/userManagment/application/user.store.js
import { defineStore } from "pinia";
import axios from "axios";

// Usar proxy configurado para evitar CORS
const API_URL = '/api/v1/Auth';
console.log('Using proxy API_URL:', API_URL);

export const useAuthStore = defineStore("auth", {
    state: () => ({
        user: null,
        loading: false,
        error: null,
    }),

    actions: {
        // Registrar usuario
        async register(userData) {
            this.loading = true;
            this.error = null;

            try {
                const response = await fetch(`${API_URL}/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(userData)
                });

                if (!response.ok) {
                    const errorData = await response.text();
                    throw new Error(`HTTP ${response.status}: ${errorData}`);
                }

                const data = await response.json();

                // Extraer token real si existe
                const token = data.token || data.accessToken || data.jwt;

                if (token) {
                    this.user = data.user || data;
                    localStorage.setItem("user", JSON.stringify(this.user));
                    localStorage.setItem("token", token);
                } else {
                    this.user = data;
                    localStorage.setItem("user", JSON.stringify(this.user));
                    localStorage.setItem("token", "fake-jwt-token");
                }

            } catch (err) {
                this.error = `Error: ${err.message}`;
            } finally {
                this.loading = false;
            }
        },

        // Login usuario
        async login(username, password) {
            this.loading = true;
            this.error = null;
            try {
                const res = await axios.post(`${API_URL}/login`, {
                    username: username,
                    password: password
                });

                const responseData = res.data;

                if (responseData && responseData.token) {
                    // El backend C# retorna: { token, username, email }
                    this.user = {
                        username: responseData.username,
                        email: responseData.email
                    };
                    
                    localStorage.setItem("user", JSON.stringify(this.user));
                    localStorage.setItem("token", responseData.token); // JWT real del backend C#
                    return true; // login exitoso
                } else {
                    this.error = "Respuesta inválida del servidor";
                    return false;
                }
            } catch (err) {
                console.error('Login error:', err);
                if (err.response?.status === 401) {
                    this.error = "Usuario o contraseña incorrectos";
                } else if (err.response?.data?.message) {
                    this.error = err.response.data.message;
                } else {
                    this.error = "Error al intentar iniciar sesión";
                }
                return false;
            } finally {
                this.loading = false;
            }
        },

        // Logout
        logout() {
            this.user = null;
            localStorage.removeItem("user");
            localStorage.removeItem("token");
        },

        // Cargar usuario desde localStorage
        loadUser() {
            const savedUser = localStorage.getItem("user");
            if (savedUser) this.user = JSON.parse(savedUser);
        },
    },
});