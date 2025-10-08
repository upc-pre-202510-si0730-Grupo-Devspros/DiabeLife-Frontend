<template>
  <div class="auth-layout">
    <!-- Botón de idioma arriba a la derecha -->
    <div class="language-container">
      <LanguageSwitcher />
    </div>

    <div class="auth-container">
      <RouterView />
    </div>
  </div>
</template>

<script setup lang="ts">
import LanguageSwitcher from "@/shared/presentation/components/language-switcher.vue";
</script>

<style scoped>
.auth-layout {
  display: flex;
  position: relative;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #E9F5FE;
}

.auth-container {
  background-color: #ffffff;
  padding: 2rem 3rem;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  width: 400px;
  max-width: 90%;
}

.language-container {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 10;
}
</style>
