// src/userManagment/application/user.store.js
import { defineStore } from "pinia";
import axios from "axios";

const API_URL = "/api/v1/Auth";

export const useAuthStore = defineStore("auth", {
    state: () => ({
        user: null,
        loading: false,
        error: null,
    }),
    actions: {
        loadUser() {
            const savedUser = localStorage.getItem("user");
            if (savedUser) this.user = JSON.parse(savedUser);
        },
        async login(username, password) {
            this.loading = true;
            this.error = null;
            try {
                const res = await axios.post(`${API_URL}/login`, { username, password });
                const data = res.data;

                // Guardar user y token
                const token = data.token || data.accessToken || data.jwt || "fake-jwt-token";
                this.user = data.user || data;
                localStorage.setItem("user", JSON.stringify(this.user));
                localStorage.setItem("token", token);

                return true;
            } catch (err) {
                this.error = err.response?.data?.message || "Error login";
                return false;
            } finally { this.loading = false; }
        },
        logout() {
            this.user = null;
            localStorage.removeItem("user");
            localStorage.removeItem("token");
        }
    }
});
