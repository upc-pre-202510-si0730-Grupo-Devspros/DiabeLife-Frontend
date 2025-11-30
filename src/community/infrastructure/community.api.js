import { BaseApi } from "../../shared/infrastructure/base-api.js";
import { BaseEndpoint } from "../../shared/infrastructure/base-endpoint.js";

export class CommunityApi extends BaseApi {
    #postsEndpoint;

    constructor() {
        const baseUrl = import.meta.env.VITE_PLATFORM_API_URL + "/v1";

        console.log("🌐 CommunityApi baseUrl:", baseUrl);

        super(baseUrl);
        this.baseUrl = baseUrl;

        this.#postsEndpoint = new BaseEndpoint(this, "/CommunityPosts");
    }


    // ============================ POSTS ============================
    getPosts() {
        return this.#postsEndpoint.getAll();
    }

    async createPost({ authorId, authorName, content, imageUrl }) {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found, user not logged in");

        const res = await fetch(`${this.baseUrl}/CommunityPosts`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                authorId,
                authorName,     // ← FALTABA ESTO
                content,
                imageUrl
            })
        });

        if (!res.ok) throw new Error(`Failed to create post: ${res.status}`);

        return res.json();
    }

    async likePost(postId, authorId) {
        const token = localStorage.getItem("token");

        const res = await fetch(`${this.baseUrl}/CommunityPosts/${postId}/likes`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                authorId: authorId
            })
        });

        if (!res.ok) {
            throw new Error(`Failed to like post: ${res.status}`);
        }

        const text = await res.text();
        return text ? JSON.parse(text) : {};
    }

    async getComments(postId) {
        const response = await fetch(`${this.baseUrl}/CommunityPosts/${postId}/Comments`);
        return response.json();
    }

    async addComment(postId, commentData) {
        const response = await fetch(`${this.baseUrl}/CommunityPosts/${postId}/Comments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(commentData),
        });
        return response.json();
    }


}
