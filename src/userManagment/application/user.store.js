// src/userManagment/application/user.store.js
import { defineStore } from "pinia";
import axios from "axios";

// Usando el proxy de Vite para evitar problemas de CORS
const API_URL = "/api/v1/Auth";

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
            
            console.log('=== INICIO DEL REGISTRO ===');
            console.log('Datos del usuario:', userData);
            console.log('URL completa de registro:', `${API_URL}/register`);
            
            try {
                const response = await fetch(`${API_URL}/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(userData)
                });
                
                console.log('Respuesta del servidor:', response);
                console.log('Status:', response.status);
                console.log('OK:', response.ok);
                
                if (!response.ok) {
                    const errorData = await response.text();
                    console.log('Error data:', errorData);
                    throw new Error(`HTTP ${response.status}: ${errorData}`);
                }
                
                const data = await response.json();
                console.log('Datos de respuesta:', data);
                
                this.user = data;
                localStorage.setItem("user", JSON.stringify(this.user));
                localStorage.setItem("token", "fake-jwt-token");
                
                console.log('=== REGISTRO EXITOSO ===');
                
            } catch (err) {
                console.log('=== ERROR EN EL REGISTRO ===');
                console.error('Error completo:', err);
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
                console.log("Login response:", res.data);

                const user = res.data;

                if (user) {
                    this.user = user;
                    localStorage.setItem("user", JSON.stringify(this.user));
                    localStorage.setItem("token", "fake-jwt-token"); // importante para router
                    return true; // login exitoso
                } else {
                    this.error = "Usuario o contraseña incorrectos";
                    return false; // login fallido
                }
            } catch (err) {
                console.error(err);
                this.error = "Error al intentar iniciar sesión";
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
