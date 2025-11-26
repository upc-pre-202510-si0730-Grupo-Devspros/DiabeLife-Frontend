export class BaseEndpoint {
    constructor(baseApi, endpointPath) {
        this.baseApi = baseApi;   // <- necesitas esto
        this.http = baseApi.http;
        this.endpointPath = endpointPath;
    }

    async getAll() {
        const token = localStorage.getItem("token");

        const url = `${this.baseApi.baseUrl}${this.endpointPath}`;

        const res = await fetch(url, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!res.ok) {
            console.error("❌ BaseEndpoint.getAll() error status:", res.status);
            throw new Error(`Failed to fetch list: ${res.status}`);
        }

        return res.json();
    }

    create(resource) {
        return this.http.post(this.endpointPath, resource);
    }
}
