// src/userManagment/infrastructure/auth.service.js
import axios from "axios";

const API_URL = import.meta.env.VITE_DIABELIFE_PLATFORM_API_URL + import.meta.env.VITE_AUTH_ENDPOINT_PATH;

export default {
    async login(username, password) {
        const { data } = await axios.post(`${API_URL}/login`, {
            username: username,
            password: password
        });
        return data;
    },

    async register(userData) {
        const { data } = await axios.post(`${API_URL}/register`, userData);
        return data;
    }
};