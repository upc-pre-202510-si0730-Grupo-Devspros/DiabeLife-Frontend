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


    likePost(id) {
        return this.#postsEndpoint.update(id, { action: "like" });
    }

    commentPost(id, comment) {
        return this.#postsEndpoint.update(id, { action: "comment", comment });
    }

    sharePost(id) {
        return this.#postsEndpoint.update(id, { action: "share" });
    }
}
