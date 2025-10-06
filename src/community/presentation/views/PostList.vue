<script setup>
import { onMounted } from "vue";
import useCommunityStore from "../../application/useCommunityStore.js";
import PostItem from "./PostItem.vue";

const store = useCommunityStore();

onMounted(() => {
  store.fetchPosts();
});
</script>

<template>
  <div>
    <div v-if="!store.postsLoaded">
      <pv-skeleton width="100%" height="200px" class="mb-3" />
      <pv-skeleton width="100%" height="200px" class="mb-3" />
    </div>

    <template v-else>
      <PostItem
          v-for="post in store.posts"
          :key="post.id"
          :post="post"
      />
      <p v-if="store.posts.length === 0" class="text-center p-3">
        No hay publicaciones aún
      </p>
    </template>
  </div>
</template>
