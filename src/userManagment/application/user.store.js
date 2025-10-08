import { defineStore } from "pinia";
import axios from "axios";

export const useAuthStore = defineStore("auth", {
    state: () => ({
        user: null,
        loading: false,
        error: null,
    }),

    actions: {
        async register(userData) {
            this.loading = true;
            this.error = null;
            try {
                const res = await axios.post("http://localhost:3000/users", userData);
                this.user = res.data;
            } catch (err) {
                this.error = "Error al registrar usuario";
            } finally {
                this.loading = false;
            }
        },

        async login(username, password) {
            this.loading = true;
            this.error = null;
            try {
                // 👉 Buscar usuario en db.json
                const res = await axios.get(`http://localhost:3000/users?username=${username}&password=${password}`);

                if (res.data.length > 0) {
                    this.user = res.data[0];
                    localStorage.setItem("token", "fake-jwt-token");
                    localStorage.setItem("user", JSON.stringify(this.user));
                } else {
                    this.error = "Usuario o contraseña incorrectos";
                }
            } catch (err) {
                this.error = "Error al intentar iniciar sesión";
            } finally {
                this.loading = false;
            }
        },

        logout() {
            this.user = null;
            localStorage.removeItem("token");
            localStorage.removeItem("user");
        },

        loadUser() {
            const savedUser = localStorage.getItem("user");
            if (savedUser) {
                this.user = JSON.parse(savedUser);
            }
        },
    },
});
