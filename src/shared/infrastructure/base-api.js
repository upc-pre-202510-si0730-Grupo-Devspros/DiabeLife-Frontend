import axios from 'axios';

export class BaseApi {
    #http;

    constructor(baseUrl) {
        this.#http = axios.create({
            baseURL: baseUrl
        });
    }

    get http() {
        return this.#http;
    }
}
