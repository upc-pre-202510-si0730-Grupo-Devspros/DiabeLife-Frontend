// src/userManagment/infrastructure/user.service.js
import axios from "axios";

const API_URL = "http://localhost:3000/users"; // json-server endpoint

export default {
    async login(username, password) {
        const { data } = await axios.get(`${API_URL}?username=${username}`);
        const user = data[0];
        if (!user || user.password !== password) {
            throw new Error("Invalid credentials");
        }
        return user;
    },

    async register(userData) {
        const { data } = await axios.post(API_URL, userData);
        return data;
    },

    async getAll() {
        const { data } = await axios.get(API_URL);
        return data;
    }
};
