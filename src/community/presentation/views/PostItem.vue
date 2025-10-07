<script setup>
import { ref, computed } from "vue";
import useCommunityStore from "../../application/useCommunityStore.js";

const props = defineProps({ post: Object });
const store = useCommunityStore();

const currentUser = ref("usuario1");

const newComment = ref("");
const commentsToShow = ref(5);
const isLiking = ref(false);
const commentMode = ref("todos");

const userHasLiked = computed(() => {
  const userLikes = store.likedPostsByUser[currentUser.value];
  return userLikes ? userLikes.has(props.post.id) : false;
});

const toggleLike = async () => {
  if (isLiking.value) return;
  isLiking.value = true;

  try {
    await store.toggleLike(props.post.id, currentUser.value);
  } catch (error) {
    console.error("Error al alternar like:", error);
  } finally {
    isLiking.value = false;
  }
};

const submitComment = async () => {
  if (!newComment.value.trim()) return;
  await store.commentPost(props.post.id, {
    author: currentUser.value,
    text: newComment.value,
    date: new Date().toISOString(),
  });
  newComment.value = "";
};

const showMore = () => (commentsToShow.value += 5);
const showLess = () => (commentsToShow.value = 5);

const toggleCommentMode = () => {
  commentMode.value =
      commentMode.value === "todos" ? "recientes" : "todos";
};

const visibleComments = computed(() => {
  if (!props.post.comments) return [];
  let sorted = [...props.post.comments];
  if (commentMode.value === "recientes") {
    sorted = sorted.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
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
        <strong>User {{ post.authorId }}</strong>
        <div class="text-500 text-sm">
          {{ new Date(post.createdAt).toLocaleString() }}
        </div>
      </div>
    </div>

    <p class="mb-3">{{ post.content }}</p>

    <img
        v-if="post.imageUrl"
        :src="post.imageUrl"
        alt="Imagen del post"
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
        <span>{{ post.likes }} Me gusta</span>
        <span class="ml-3">{{ post.comments.length }} Comentarios</span>
      </div>

      <pv-button
          text
          size="small"
          class="text-sm text-blue-500"
          @click="toggleCommentMode"
      >
        {{ commentMode === 'todos'
          ? 'Ver más recientes'
          : 'Ver todos los comentarios' }}
      </pv-button>
    </div>

    <div
        v-if="post.comments && post.comments.length > 0"
        class="mb-3 p-2 comments-container"
    >
      <div
          v-for="(comment, index) in visibleComments"
          :key="index"
          class="mb-2 comment-item"
      >
        <strong>{{ comment.author }}:</strong>
        <span class="ml-2">{{ comment.text }}</span>
      </div>


      <div class="text-center mt-2">
        <pv-button
            v-if="commentsToShow < post.comments.length"
            text
            size="small"
            @click="showMore"
        >
          Ver más comentarios
        </pv-button>

        <pv-button
            v-else-if="commentsToShow > 5"
            text
            size="small"
            @click="showLess"
        >
          Ver menos comentarios
        </pv-button>
      </div>
    </div>

    <div class="flex gap-2">
      <pv-input-text
          v-model="newComment"
          placeholder="Escribe un comentario..."
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
  aspect-ratio: 16 / 9;
  object-fit: cover;
  object-position: center;
  border-radius: 10px;
  display: block;
}
</style>
