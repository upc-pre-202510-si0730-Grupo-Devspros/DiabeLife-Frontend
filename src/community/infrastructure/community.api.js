/**
 * Community API
 * Provides methods to interact with the community-related backend endpoints, such as posts, likes, comments, and shares.
 * Extends the `BaseApi` class to leverage common API functionality.
 * @author Gabriel Mamani
 * @class
 *
 * @property {BaseEndpoint} #postsEndpoint - Private endpoint handler for post-related operations.
 *
 * @function getPosts
 * @description Retrieves all posts from the community endpoint.
 * @returns {Promise<Array>} A promise resolving to the list of posts.
 *
 * @function getPostById
 * @description Retrieves a specific post by its unique identifier.
 * @param {number} id - The unique ID of the post.
 * @returns {Promise<Object>} A promise resolving to the post data.
 *
 * @function createPost
 * @description Creates a new post in the community.
 * @param {Object} resource - The post resource object to be created.
 * @returns {Promise<Object>} A promise resolving to the created post.
 *
 * @function updatePost
 * @description Updates an existing post in the community.
 * @param {Object} resource - The post resource containing updated information.
 * @returns {Promise<Object>} A promise resolving to the updated post.
 *
 * @function deletePost
 * @description Deletes a post from the community by its ID.
 * @param {number} id - The unique identifier of the post.
 * @returns {Promise<void>} A promise resolving when the deletion is complete.
 *
 * @function likePost
 * @description Adds a like to a post by a specific user.
 * @param {number} id - The post ID to like.
 * @param {number} userId - The ID of the user who liked the post.
 * @returns {Promise<Object>} A promise resolving to the updated post.
 *
 * @function unlikePost
 * @description Removes a like from a post for a specific user.
 * @param {number} id - The post ID to unlike.
 * @param {number} userId - The ID of the user who unliked the post.
 * @returns {Promise<Object>} A promise resolving to the updated post.
 *
 * @function commentPost
 * @description Adds a comment to a specific post.
 * @param {number} id - The post ID to comment on.
 * @param {Object} comment - The comment object to be added.
 * @returns {Promise<Object>} A promise resolving to the updated post.
 *
 * @function sharePost
 * @description Simulates sharing a post by updating it with a "share" action.
 * @param {number} id - The ID of the post to share.
 * @returns {Promise<Object>} A promise resolving to the shared post.
 *
 * @example
 * const api = new CommunityApi();
 *
 * // Fetch posts
 * const posts = await api.getPosts();
 * console.log(posts);
 *
 * // Like a post
 * await api.likePost(1, 5);
 *
 * // Add a comment
 * await api.commentPost(1, { userId: 5, text: "Great post!" });
 */

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
