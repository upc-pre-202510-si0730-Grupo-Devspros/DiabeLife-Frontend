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
  background: linear-gradient(135deg, #007ad9, #00c6ff);
}

.auth-container {
  background: white;
  padding: 2rem 3rem;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  width: 400px;
  max-width: 90%;
}
</style>
