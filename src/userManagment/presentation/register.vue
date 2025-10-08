<template>
  <div class="auth-page">
    <div class="auth-card">
      <!-- Logo -->
      <img
          src="https://i.postimg.cc/c4Cdqjtg/Whats-App-Image-2025-10-01-at-13-53-49-removebg-preview.png"
          class="logo"
          alt="Diabelife logo"
      />

      <!-- Bienvenida -->
      <h2>¡Regístrate en Diabelife!</h2>
      <p class="welcome-text">Comienza a controlar tu diabetes de forma fácil y segura.</p>

      <!-- Formulario -->
      <form @submit.prevent="handleRegister">
        <input v-model="username" type="text" placeholder="Username" required />
        <input v-model="email" type="email" placeholder="Email" required />
        <input v-model="password" type="password" placeholder="Password" required />

        <button type="submit" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          <span v-else>Register</span>
        </button>

        <div v-if="error" class="error-msg">{{ error }}</div>
        <div v-if="success" class="success-msg">Registro exitoso! Ahora puedes iniciar sesión.</div>

        <div class="first-time">
          <router-link to="/auth/login">¿Ya tienes cuenta? Login</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/userManagment/application/user.store.js';
import { storeToRefs } from 'pinia';

const authStore = useAuthStore();
const { error, loading } = storeToRefs(authStore);

const username = ref('');
const email = ref('');
const password = ref('');
const success = ref(false);

const handleRegister = async () => {
  success.value = false;
  try {
    await authStore.register({
      username: username.value,
      email: email.value,
      password: password.value,
    });
    success.value = true;
  } catch (err) {
    console.error("Registration failed:", err);
  }
};
</script>

<style scoped>
/* Fondo y centrado */
.auth-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #007ad9, #00c6ff);
  font-family: 'Arial', sans-serif;
}

/* Card central */
.auth-card {
  background: #fff;
  padding: 40px 30px;
  border-radius: 16px;
  width: 360px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
}

/* Logo */
.logo {
  width: 100px;
  margin-bottom: 15px;
}

/* Bienvenida */
h2 {
  margin-bottom: 5px;
  color: #1f2a36;
}

.welcome-text {
  font-size: 0.9rem;
  color: #555;
  margin-bottom: 20px;
}

/* Inputs */
input {
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border-radius: 8px;
  border: 1px solid #ccc;
}

/* Botón Register */
button[type="submit"] {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: none;
  background: #007ad9;
  color: white;
  cursor: pointer;
  transition: background 0.2s;
}

button[type="submit"]:hover {
  background: #005fa3;
}

/* Enlace a login */
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

/* Mensajes */
.error-msg {
  color: red;
  margin-top: 10px;
  font-size: 0.85rem;
}

.success-msg {
  color: green;
  margin-top: 10px;
  font-size: 0.85rem;
}

/* Spinner */
.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid white;
  border-top: 2px solid #005fa3;
  border-radius: 50%;
  display: inline-block;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
