import { BaseApi } from "../../shared/infrastructure/base-api.js";
import { BaseEndpoint } from "../../shared/infrastructure/base-endpoint.js";

export class CommunityApi extends BaseApi {
    #postsEndpoint;

    constructor() {
        const swaggerUrl = import.meta.env.API;
        const baseUrl = swaggerUrl?.includes("/swagger/")
            ? swaggerUrl.split("/swagger")[0] + "/api/v1"
            : "/api/v1"; // 🔹 usar proxy


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

    async likePost(postId) {
        const token = localStorage.getItem("token");
        const res = await fetch(`${this.baseUrl}/CommunityPosts/${postId}/like`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(`Failed to like post: ${res.status}`);
        return res.json();
    }
    // ============================ COMMENTS ============================
    async getComments(postId) {
        const token = localStorage.getItem("token");

        const res = await fetch(`${this.baseUrl}/CommunityPosts/${postId}/comments`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!res.ok) throw new Error(`Failed to fetch comments: ${res.status}`);
        return res.json();
    }

    async addComment(postId, comment) {
        const token = localStorage.getItem("token");

        const res = await fetch(`${this.baseUrl}/CommunityPosts/${postId}/comments`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                authorId: comment.authorId,
                text: comment.text
            })
        });

        if (!res.ok) {
            console.error("❌ Add comment error:", res.status);
            throw new Error(`Failed to add comment: ${res.status}`);
        }

        return res.json();
    }

    // Puedes agregar toggleLike/unlikePost si tu backend los soporta
}
