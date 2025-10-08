import axios from "axios";

const API_URL = import.meta.env.VITE_DIABELIFE_PLATFORM_API_URL + import.meta.env.VITE_USERS_ENDPOINT_PATH;

class UserService {
    async register(userData) {
        const response = await axios.post(API_URL, userData);
        return response.data;
    }

    async login(username, password) {
        const response = await axios.get(API_URL); // trae todos los usuarios
        const user = response.data.find(u => u.username === username && u.password === password);
        if (user) return user;
        throw new Error("Usuario o contraseña incorrectos");
    }


    async getAll() {
        const response = await axios.get(API_URL);
        return response.data;
    }
}

export default new UserService();
