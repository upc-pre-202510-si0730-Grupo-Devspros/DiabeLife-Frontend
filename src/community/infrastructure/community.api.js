import { BaseApi } from "../../shared/infrastructure/base-api.js";
import { BaseEndpoint } from "../../shared/infrastructure/base-endpoint.js";

export class CommunityApi extends BaseApi {
    #postsEndpoint;

    constructor() {
        super();

        // ========= BASE URL desde API (swagger) =========
        const swaggerUrl = import.meta.env.API;

        if (swaggerUrl && swaggerUrl.includes("/swagger/")) {
            // https://backend.com/swagger/index.html → https://backend.com/api/v1
            const root = swaggerUrl.split("/swagger")[0];
            this.baseUrl = `${root}/api/v1`;
        } else {
            // fallback: usa VITE_PLATFORM_API_URL
            this.baseUrl = import.meta.env.VITE_PLATFORM_API_URL;
        }

        console.log("🌐 CommunityApi baseUrl:", this.baseUrl);

        // ========= POSTS ENDPOINT =========
        const postsPath = import.meta.env.VITE_COMMUNITY_ENDPOINT_PATH || "/CommunityPosts";
        this.#postsEndpoint = new BaseEndpoint(this, postsPath);

        // ========= COMMENTS BASE URL =========
        const commentPath = import.meta.env.VITE_COMMENT_ENDPOINT_PATH || "/community-posts";
        this.commentBaseUrl = `${this.baseUrl}${commentPath}`;
    }

    // ===============================================
    // POSTS
    // ===============================================
    getPosts() {
        return this.#postsEndpoint.getAll();
    }

    getPostById(id) {
        return this.#postsEndpoint.getById(id);
    }

    createPost(resource) {
        return this.#postsEndpoint.create(resource);
    }

    updatePost(resource) {
        return this.#postsEndpoint.update(resource.id, resource);
    }

    deletePost(id) {
        return this.#postsEndpoint.delete(id);
    }

    async likePost(id, userId) {
        const post = await this.getPostById(id);
        post.likedBy = post.likedBy || [];

        if (!post.likedBy.includes(userId)) {
            post.likedBy.push(userId);
            post.likes = (post.likes || 0) + 1;
        }

        return this.updatePost(post);
    }

    async unlikePost(id, userId) {
        const post = await this.getPostById(id);

        if (post.likedBy?.includes(userId)) {
            post.likedBy = post.likedBy.filter(u => u !== userId);
            post.likes = Math.max(0, (post.likes || 0) - 1);
        }

        return this.updatePost(post);
    }

    sharePost(id) {
        return this.#postsEndpoint.update(id, { action: "share" });
    }

    // ===============================================
    // COMMENTS
    // ===============================================
    async getComments(postId) {
        const res = await fetch(
            `${this.commentBaseUrl}/${postId}/Comments`,
            { method: "GET" }
        );

        if (!res.ok) throw new Error(`Failed to fetch comments: ${res.status}`);
        return res.json();
    }

    async addComment(postId, comment) {
        const res = await fetch(
            `${this.commentBaseUrl}/${postId}/Comments`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...comment, postId }),
            }
        );

        if (!res.ok) throw new Error(`Failed to create comment: ${res.status}`);
        return res.json();
    }
}
