import axios from 'axios';

export class ApiClient {
    constructor(baseURL) {
        this.client = axios.create({
            baseURL: baseURL || import.meta.env.VITE_DIABELIFE_PLATFORM_API_URL,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    async get(url) {
        const response = await this.client.get(url);
        return response.data;
    }

    async post(url, data) {
        const response = await this.client.post(url, data);
        return response.data;
    }

    async put(url, data) {
        const response = await this.client.put(url, data);
        return response.data;
    }

    async patch(url, data) {
        const response = await this.client.patch(url, data);
        return response.data;
    }

    async delete(url) {
        const response = await this.client.delete(url);
        return response.data;
    }
}
