/**
 * Community Store
 * Manages the state and logic for community posts within the application.
 * Utilizes Pinia for state management and interacts with the API layer for CRUD operations.
 * @module useCommunityStore
 *
 * @property {Ref<Array>} posts - Reactive list of posts fetched from the API.
 * @property {Ref<Array>} errors - Reactive list of errors that occur during API calls.
 * @property {Ref<boolean>} postsLoaded - Indicates whether posts have been successfully loaded.
 * @property {ComputedRef<number>} postsCount - Computed total number of posts loaded.
 * @property {Ref<Object>} likedPostsByUser - Tracks posts liked by each user (not persisted in the database).
 *
 * @function fetchPosts
 * @description Fetches all posts from the backend API and stores them in state.
 *
 * @function getPostById
 * @description Retrieves a single post by its unique identifier.
 * @param {number|string} id - The unique ID of the post.
 * @returns {Object|undefined} The post entity, if found.
 *
 * @function addPost
 * @description Creates a new post and adds it to the state.
 * @param {Object} post - The post entity to add.
 *
 * @function updatePost
 * @description Updates an existing post both in the backend and in the local state.
 * @param {Object} post - The post entity with updated fields.
 *
 * @function deletePost
 * @description Deletes a post by its ID from both the backend and local state.
 * @param {Object} post - The post entity to delete.
 *
 * @function toggleLike
 * @description Toggles a like or unlike on a post for a specific user.
 * @param {number} postId - The ID of the post to like/unlike.
 * @param {number} userId - The ID of the user performing the action.
 *
 * @function commentPost
 * @description Adds a new comment to a specific post and updates it in the backend.
 * @param {number} id - The ID of the post to comment on.
 * @param {Object} comment - The comment object to add.
 *
 * @example
 * import useCommunityStore from '@/stores/communityStore';
 *
 * const communityStore = useCommunityStore();
 * await communityStore.fetchPosts();
 * console.log(communityStore.postsCount); // e.g., 10
 */

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { CommunityApi } from "../infrastructure/community.api.js";
import { PostAssembler } from "../infrastructure/post.assembler.js";

const communityApi = new CommunityApi();

const useCommunityStore = defineStore("community", () => {
    const posts = ref([]);
    const errors = ref([]);
    const postsLoaded = ref(false);

    const postsCount = computed(() => (postsLoaded.value ? posts.value.length : 0));

    const likedPostsByUser = ref({});

    async function fetchPosts() {
        postsLoaded.value = false;
        try {
            const response = await communityApi.getPosts();
            posts.value = PostAssembler.toEntitiesFromResponse(response) || [];
        } catch (error) {
            errors.value.push(error);
        } finally {
            postsLoaded.value = true;
        }
    }

    function getPostById(id) {
        const idInt = parseInt(id);
        return posts.value.find((p) => p.id === idInt);
    }

    async function addPost(post) {
        try {
            const response = await communityApi.createPost(PostAssembler.toResourceFromEntity(post));
            const newPost = PostAssembler.toEntityFromResource(response.data);
            posts.value.unshift(newPost);
        } catch (error) {
            errors.value.push(error);
        }
    }

    async function updatePost(post) {
        try {
            const response = await communityApi.updatePost(PostAssembler.toResourceFromEntity(post));
            const updatedPost = PostAssembler.toEntityFromResource(response.data);
            const index = posts.value.findIndex((p) => p.id === updatedPost.id);
            if (index !== -1) posts.value[index] = updatedPost;
        } catch (error) {
            errors.value.push(error);
        }
    }

    async function deletePost(post) {
        try {
            await communityApi.deletePost(post.id);
            const index = posts.value.findIndex((p) => p.id === post.id);
            if (index !== -1) posts.value.splice(index, 1);
        } catch (error) {
            errors.value.push(error);
        }
    }

    async function toggleLike(postId, userId) {
        try {
            const post = getPostById(postId);
            if (!post) return;

            if (!likedPostsByUser.value[userId]) likedPostsByUser.value[userId] = new Set();

            const hasLiked = likedPostsByUser.value[userId].has(postId);

            if (hasLiked) {
                // Quitar like
                likedPostsByUser.value[userId].delete(postId);
                post.likes = Math.max(0, post.likes - 1);
            } else {
                // Dar like
                likedPostsByUser.value[userId].add(postId);
                post.likes++;
            }

            await updatePost(post);
        } catch (error) {
            console.error("Error al alternar like:", error);
            errors.value.push(error);
        }
    }

    async function commentPost(id, comment) {
        try {
            const post = getPostById(id);
            post.comments.push(comment);
            await updatePost(post);
        } catch (error) {
            errors.value.push(error);
        }
    }

    return {
        posts,
        errors,
        postsLoaded,
        postsCount,
        fetchPosts,
        getPostById,
        addPost,
        updatePost,
        deletePost,
        toggleLike,
        commentPost,
        likedPostsByUser,
    };
});

export default useCommunityStore;
