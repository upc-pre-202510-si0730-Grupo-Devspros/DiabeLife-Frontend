import { BaseApi } from "../../shared/infrastructure/base-api.js";
import { BaseEndpoint } from "../../shared/infrastructure/base-endpoint.js";

export class CommunityApi extends BaseApi {
    #postsEndpoint;

    constructor() {
        super();
        this.#postsEndpoint = new BaseEndpoint(this, import.meta.env.VITE_COMMUNITY_ENDPOINT_PATH);
    }

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

        if (!post.likedBy) post.likedBy = [];
        if (!post.likedBy.includes(userId)) {
            post.likedBy.push(userId);
            post.likes = (post.likes || 0) + 1;
        }

        return this.updatePost(post);
    }

    async unlikePost(id, userId) {
        const post = await this.getPostById(id);

        if (post.likedBy && post.likedBy.includes(userId)) {
            post.likedBy = post.likedBy.filter((u) => u !== userId);
            post.likes = Math.max(0, (post.likes || 0) - 1);
        }

        return this.updatePost(post);
    }

    async commentPost(id, comment) {
        const post = await this.getPostById(id);

        if (!post.comments) post.comments = [];
        post.comments.push(comment);

        return this.updatePost(post);
    }

    sharePost(id) {
        return this.#postsEndpoint.update(id, { action: "share" });
    }
}
