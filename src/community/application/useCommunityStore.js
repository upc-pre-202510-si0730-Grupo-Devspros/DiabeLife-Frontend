import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { CommunityApi } from "../infrastructure/community.api.js";

const api = new CommunityApi();

export const useCommunityStore = defineStore("community", () => {
    const posts = ref([]);
    const errors = ref([]);
    const postsLoaded = ref(false);
    const likedPostsByUser = ref({});

    const postsCount = computed(() => posts.value.length);

    // ================== FETCH POSTS ==================
    const fetchPosts = async () => {
        postsLoaded.value = false;
        try {
            const data = await api.getPosts();
            posts.value = data;

            // opcional: precargar comentarios si quieres
            // await Promise.all(posts.value.map(async p => {
            //     p.comments = await api.getComments(p.id);
            // }));

        } catch (err) {
            errors.value.push(err);
        } finally {
            postsLoaded.value = true;
        }
    };

    // ================== ADD POST ==================
    const addPost = async (post) => {
        try {
            const newPost = await api.createPost({
                authorId: post.authorId,
                content: post.content,
                imageUrl: post.imageUrl || "",
            });
            posts.value.unshift(newPost);
        } catch (err) {
            errors.value.push(err);
        }
    };

    // ================== LIKE / UNLIKE ==================
    const toggleLike = async (postId, userId) => {
        try {
            const post = posts.value.find(p => p.id === postId);
            if (!post) return;

            if (!likedPostsByUser.value[userId]) likedPostsByUser.value[userId] = new Set();

            const hasLiked = likedPostsByUser.value[userId].has(postId);

            if (hasLiked) {
                await api.unlikePost(postId, userId);
                likedPostsByUser.value[userId].delete(postId);
                post.likes = Math.max(0, post.likes - 1);
            } else {
                await api.likePost(postId, userId);
                likedPostsByUser.value[userId].add(postId);
                post.likes = (post.likes || 0) + 1;
            }
        } catch (err) {
            errors.value.push(err);
        }
    };

    // ================== COMMENTS ==================
    const fetchComments = async (postId) => {
        try {
            return await api.getComments(postId);
        } catch (err) {
            errors.value.push(err);
            return [];
        }
    };

    const addComment = async (postId, comment) => {
        try {
            const newComment = await api.addComment(postId, {
                authorId: comment.authorId,
                content: comment.text,
            });

            const post = posts.value.find(p => p.id === postId);
            if (post) {
                post.comments = post.comments || [];
                post.comments.push(newComment);
            }
        } catch (err) {
            errors.value.push(err);
        }
    };

    return {
        posts,
        errors,
        postsLoaded,
        postsCount,
        likedPostsByUser,
        fetchPosts,
        addPost,
        toggleLike,
        fetchComments,
        addComment,
    };
});
