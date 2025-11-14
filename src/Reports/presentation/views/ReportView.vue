<template>
  <div class="report-view">
    <div v-if="authError" class="auth-error">
      <h3>⚠️ Problema de autenticación</h3>
      <p>{{ authError }}</p>
      <button @click="redirectToLogin" class="retry-btn">Ir al Login</button>
    </div>
    <div v-else class="reports-container">
      <NewReportSection />
      <div class="divider"></div>
      <ShareReportSection />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/userManagment/application/user.store.js';
import NewReportSection from '@/Reports/presentation/components/NewReportSection.vue';
import ShareReportSection from '@/Reports/presentation/components/ShareReportSection.vue';

const router = useRouter();
const authStore = useAuthStore();
const authError = ref('');

onMounted(() => {
  // Verificar autenticación
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  if (!token || !user) {
    authError.value = 'No hay sesión activa. Por favor, inicia sesión.';
    return;
  }
  
  if (token === 'fake-jwt-token') {
    authError.value = 'Tu sesión necesita un token JWT real para acceder a Reports. Por favor, cierra sesión y vuelve a iniciar sesión para obtener un token válido.';
    return;
  }
});

const redirectToLogin = () => {
  authStore.logout();
  router.push('/auth/login');
};
</script>

<style scoped>
.report-view {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.reports-container {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 2rem;
  align-items: start;
}

.divider {
  width: 1px;
  background: linear-gradient(
      to bottom,
      transparent,
      #e5e7eb 20%,
      #e5e7eb 80%,
      transparent
  );
  height: 100%;
  min-height: 400px;
}

.auth-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  margin: 2rem auto;
  max-width: 500px;
}

.auth-error h3 {
  color: #dc2626;
  margin-bottom: 1rem;
}

.auth-error p {
  color: #374151;
  margin-bottom: 1.5rem;
}

.retry-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.retry-btn:hover {
  background: #2563eb;
}

@media (max-width: 968px) {
  .reports-container {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .divider {
    display: none;
  }
}
</style>
