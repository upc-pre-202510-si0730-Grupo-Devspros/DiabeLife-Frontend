import axios from "axios";

const API_URL = import.meta.env.VITE_DIABELIFE_PLATFORM_API_URL + import.meta.env.VITE_AUTH_ENDPOINT_PATH;

class UserService {
    async register(userData) {
        const response = await axios.post(`${API_URL}/register`, userData);
        return response.data;
    }

    async login(username, password) {
        const response = await axios.post(`${API_URL}/login`, {
            username: username,
            password: password
        });
        return response.data;
    }
}

export default new UserService();