import axios from "axios";

const API_URL = "http://localhost:3000/users"; // tu endpoint del json-server

class UserService {
    async getAll() {
        const response = await axios.get(API_URL);
        return response.data;
    }

    async register(userData) {
        const response = await axios.post(API_URL, userData);
        return response.data;
    }

    async login(username, password) {
        const response = await axios.get(`${API_URL}?username=${username}&password=${password}`);
        if (response.data.length > 0) {
            // usuario encontrado
            return response.data[0];
        } else {
            throw new Error("Usuario o contraseña incorrectos");
        }
    }

    async logout() {
        // sólo limpia el localStorage
        localStorage.removeItem("user");
    }
}

// ✅ exporta una instancia
export default new UserService();
