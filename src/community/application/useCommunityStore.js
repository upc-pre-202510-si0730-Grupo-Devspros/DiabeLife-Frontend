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

    // Mapa temporal de likes por usuario (no se guarda en db.json)
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

    // ❤️ LIKE / UNLIKE
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
