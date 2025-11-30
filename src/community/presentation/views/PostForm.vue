<script setup>
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/userManagment/application/user.store.js";
import { useCommunityStore } from "@/community/application/useCommunityStore.js";
import { toRaw } from "vue";

const { t } = useI18n();
const auth = useAuthStore();
const store = useCommunityStore();

const text = ref("");
const imageUrl = ref(null);
const fileInput = ref(null);

// Cargar el usuario desde localStorage
auth.loadUser();

// Computed seguro
const currentUser = computed(() => {
  if (!auth.user) return null;
  return toRaw(auth.user);
});

// Image upload
const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => { imageUrl.value = reader.result; };
  reader.readAsDataURL(file);
};

// Submit post
const submitPost = async () => {
  if (!currentUser.value) {
    console.error("Usuario no logueado");
    return;
  }

  if (!text.value.trim() && !imageUrl.value) return;

  try {
    await store.addPost({
      authorId: currentUser.value.id ?? currentUser.value.userId,
      authorName: currentUser.value.username ?? currentUser.value.fullName ?? currentUser.value.name,
      content: text.value,
      imageUrl: imageUrl.value || null
    });

    text.value = "";
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
        <!-- ⚡ t() ya funciona -->
        <pv-textarea
            v-model="text"
            :placeholder="t('community.placeholder')"
            auto-resize
            rows="3"
            class="w-full mb-3"
        />
        <div v-if="imageUrl" class="mb-3">
          <img :src="imageUrl" alt="preview" class="post-image-preview" />
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
              :disabled="!text.trim() && !imageUrl"
          />
        </div>
      </div>
    </div>
  </div>
</template>


<style scoped>
.hidden { display: none; }
.post-image-preview {
  width: 100%;
  height: auto;
  max-height: 400px;
  object-fit: contain;
  border-radius: 12px;
  background-color: #f8f9fa;
}
</style>
