<script setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/userManagment/application/user.store.js";
import {useCommunityStore} from "@/community/application/useCommunityStore.js";

const { t } = useI18n();
const store = useCommunityStore();
const auth = useAuthStore();

const content = ref("");
const imageUrl = ref(null);
const fileInput = ref(null);

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    imageUrl.value = reader.result;
  };
  reader.readAsDataURL(file);
};

const submitPost = async () => {
  if (!content.value.trim() && !imageUrl.value) return;

  try {
    await store.addPost({
      authorId: auth.user.id,
      content: content.value,
      imageUrl: imageUrl.value || "",
    });

    content.value = "";
    imageUrl.value = null;
    if (fileInput.value) fileInput.value.value = "";
  } catch (error) {
    console.error("Error creating post:", error);
  }
};
</script>

<template>
  <div class="p-card p-3 mb-4 shadow-1 border-round">
    <div class="flex gap-3">
      <pv-avatar icon="pi pi-user" shape="circle" size="large" />

      <div class="flex-1">
        <pv-textarea
            v-model="content"
            :placeholder="t('community.placeholder')"
            auto-resize
            rows="3"
            class="w-full mb-3"
        />

        <div v-if="imageUrl" class="mb-3">
          <img
              :src="imageUrl"
              alt="preview"
              class="post-image-preview"
          />
        </div>

        <div class="flex justify-content-between align-items-center">
          <div class="relative">
            <pv-button
                icon="pi pi-image"
                text
                rounded
                class="p-button-sm"
                @click="$refs.fileInput.click()"
                :aria-label="t('community.addImage')"
            />

            <input
                ref="fileInput"
                type="file"
                accept="image/*"
                @change="handleImageUpload"
                class="hidden"
            />
          </div>

          <pv-button
              :label="t('community.publish')"
              icon="pi pi-send"
              @click="submitPost"
              :disabled="!content.trim() && !imageUrl"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hidden {
  display: none;
}
.post-image-preview {
  width: 100%;
  height: auto;
  max-height: 400px;
  object-fit: contain;
  border-radius: 12px;
  background-color: #f8f9fa;
}
</style>
