<template>
  <div class="auth-layout">
    <div class="auth-container">
      <RouterView />
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.auth-layout {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #E9F5FE; /* ✅ Fondo uniforme */
}

.auth-container {
  background-color: #E9F5FE; /* ✅ Fondo uniforme */
  padding: 2rem 3rem;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  width: 400px;

  max-width: 90%;
}
</style>
