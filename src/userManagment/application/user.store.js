// src/userManagment/application/user.store.js
import { defineStore } from "pinia";
import axios from "axios";

const API_URL =
    import.meta.env.VITE_DIABELIFE_PLATFORM_API_URL +
    import.meta.env.VITE_USERS_ENDPOINT_PATH;

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
                const res = await axios.post(API_URL, userData);
                this.user = res.data;
                localStorage.setItem("user", JSON.stringify(this.user));
                localStorage.setItem("token", "fake-jwt-token"); // Para activar el beforeEach
            } catch (err) {
                console.error(err);
                this.error = "Error al registrar usuario";
            } finally {
                this.loading = false;
            }
        },

        // Login usuario
        async login(username, password) {
            this.loading = true;
            this.error = null;
            try {
                const res = await axios.get(API_URL); // obtenemos todos los usuarios
                console.log("Usuarios obtenidos:", res.data);

                const user = res.data.find(
                    (u) => u.username === username && u.password === password
                );

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
