<script setup>
const props = defineProps({ post: Object });

if (!props.post.comments) {
  props.post.comments = [];
}

import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/userManagment/application/user.store.js";
import { useCommunityStore } from "@/community/application/useCommunityStore.js";

const { t } = useI18n();
const store = useCommunityStore();
const auth = useAuthStore();

const newComment = ref("");
const commentsToShow = ref(5);
const isLiking = ref(false);
const commentMode = ref("todos");

const userHasLiked = computed(() => {
  const userLikes = store.likedPostsByUser[auth.user.id];
  return userLikes ? userLikes.has(props.post.id) : false;
});

const toggleLike = async () => {
  if (isLiking.value) return;
  isLiking.value = true;

  try {
    await store.toggleLike(props.post.id, auth.user.id);
  } catch (error) {
    console.error("Error toggling like:", error);
  } finally {
    isLiking.value = false;
  }
};

const submitComment = async () => {
  if (!newComment.value.trim()) return;

  await store.addComment(props.post.id, {
    authorId: auth.user.id,
    text: newComment.value,   // ✔ backend usa text
  });

  newComment.value = "";
};

const showMore = () => (commentsToShow.value += 5);
const showLess = () => (commentsToShow.value = 5);
const toggleCommentMode = () => {
  commentMode.value = commentMode.value === "todos" ? "recientes" : "todos";
};

const visibleComments = computed(() => {
  if (!props.post.comments) return [];

  let sorted = [...props.post.comments];

  if (commentMode.value === "recientes") {
    sorted = sorted.sort(
        (a, b) =>
            new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
    );
  }

  return sorted.slice(0, commentsToShow.value);
});
</script>

<template>
  <div class="p-card p-3 mb-4 shadow-1 border-round">
    <div class="flex align-items-center gap-3 mb-3">
      <pv-avatar icon="pi pi-user" shape="circle" />
      <div>
        <strong>{{ post.authorName }}</strong>
        <div class="text-500 text-sm">
          {{ new Date(post.createdAt).toLocaleString() }}
        </div>
      </div>
    </div>

    <!-- CAMBIO AQUÍ 👉 mostrar text -->
    <p class="mb-3">{{ post.content }}</p>

    <img
        v-if="post.imageUrl"
        :src="post.imageUrl"
        :alt="t('post.imageAlt')"
        class="post-image mb-3"
    />

    <div class="flex align-items-center justify-content-between mb-3">
      <div class="flex align-items-center gap-3">
        <pv-button
            :icon="userHasLiked ? 'pi pi-heart-fill' : 'pi pi-heart'"
            text
            rounded
            :class="{ 'text-red-500': userHasLiked }"
            @click="toggleLike"
            :disabled="isLiking"
        />
        <span>{{ post.likes }} {{ t("post.likes") }}</span>
        <span class="ml-3">{{ post.comments?.length || 0 }} {{ t("post.comments") }}</span>
      </div>

      <pv-button
          text
          size="small"
          class="text-sm text-blue-500"
          @click="toggleCommentMode"
      >
        {{ commentMode === "todos" ? t("post.viewRecent") : t("post.viewAll") }}
      </pv-button>
    </div>

    <div v-if="post.comments && post.comments.length > 0" class="mb-3 p-2 comments-container">
      <div v-for="(comment, index) in visibleComments" :key="index" class="mb-2 comment-item">
        <strong>{{ comment.author || "user" + comment.authorId }}:</strong>
        <span class="ml-2">{{ comment.text }}</span>
      </div>

      <div class="text-center mt-2">
        <pv-button
            v-if="commentsToShow < post.comments.length"
            text
            size="small"
            @click="showMore"
        >
          {{ t("post.showMore") }}
        </pv-button>

        <pv-button
            v-else-if="commentsToShow > 5"
            text
            size="small"
            @click="showLess"
        >
          {{ t("post.showLess") }}
        </pv-button>
      </div>
    </div>

    <div class="flex gap-2">
      <pv-input-text
          v-model="newComment"
          :placeholder="t('post.writeComment')"
          class="flex-1"
          @keydown.enter.prevent="submitComment"
      />
      <pv-button
          icon="pi pi-send"
          rounded
          @click="submitComment"
          :disabled="!newComment.trim()"
      />
    </div>
  </div>
</template>

<style scoped>
.post-image {
  width: 100%;
  max-width: 600px;
  aspect-ratio: 16/9;
  object-fit: cover;
  border-radius: 10px;
}
</style>
