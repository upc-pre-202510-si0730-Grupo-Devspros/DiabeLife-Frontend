<template>
  <div class="auth-page">
    <div class="auth-card">
      <img
          src="https://i.postimg.cc/JzxbPmgK/logo-removebg-preview.png"
          class="logo"
          alt="Diabelife logo"
      />

      <h2>Crea tu cuenta</h2>
      <p class="welcome-text">Únete a Diabelife y mejora tu control de salud.</p>

      <form @submit.prevent="handleRegister">
        <input v-model="username" type="text" placeholder="Usuario" required />
        <input v-model="email" type="email" placeholder="Correo electrónico" required />
        <input v-model="password" type="password" placeholder="Contraseña" required />

        <button type="submit" :disabled="auth.loading">
          <span v-if="auth.loading" class="spinner"></span>
          <span v-else>Registrarse</span>
        </button>

        <div v-if="auth.error" class="error-msg">{{ auth.error }}</div>

        <div class="first-time">
          <router-link to="/auth/login">¿Ya tienes cuenta? Inicia sesión</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/userManagment/application/user.store.js';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();

const username = ref('');
const email = ref('');
const password = ref('');

const handleRegister = async () => {
  await auth.register({
    username: username.value,
    email: email.value,
    password: password.value,
  });  if (!auth.error) router.push('/auth/login');
};
</script>

<style scoped>
.auth-page {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;

  display: flex;
  justify-content: center;
  align-items: center;

  background-color: #E9F5FE;
  font-family: 'Arial', sans-serif;
  z-index: 9999;
}


.auth-card {
  background-color: white;
  padding: 40px 45px;
  border-radius: 16px;
  width: 400px;
  max-width: 90%;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.logo {
  width: 80px;
  margin-bottom: 10px;
}

h2 {
  margin-bottom: 5px;
  color: #1f2a36;
}

.welcome-text {
  font-size: 0.9rem;
  color: #333;
  margin-bottom: 15px;
}

input {
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border-radius: 8px;
  border: 1px solid #ccc;
  outline: none;
  background: #ffffff;
  color: #1f2a36;
  transition: box-shadow 0.3s ease;
}

input:focus {
  box-shadow: 0 0 0 2px #007ad9;
}

button[type="submit"] {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: none;
  background: #325875;
  color: white;
  cursor: pointer;
  transition: background 0.2s;
}

button[type="submit"]:hover {
  background: #004e90;
}

.first-time {
  margin-top: 15px;
}

.first-time a {
  color: #007ad9;
  text-decoration: none;
}

.first-time a:hover {
  text-decoration: underline;
}

.error-msg {
  color: #d9534f;
  margin-top: 10px;
  font-size: 0.85rem;
}

.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid white;
  border-top: 2px solid #e9f5fe;
  border-radius: 50%;
  display: inline-block;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>