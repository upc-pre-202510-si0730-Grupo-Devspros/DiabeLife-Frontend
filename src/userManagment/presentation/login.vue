<template>
  <div class="auth-page">


    <div class="auth-card">
      <img
          src="https://i.postimg.cc/c4Cdqjtg/Whats-App-Image-2025-10-01-at-13-53-49-removebg-preview.png"
          class="logo"
          alt="Diabelife logo"
      />

      <h2>¡Bienvenido a Diabelife!</h2>
      <p class="welcome-text">Controla tu diabetes y gestiona tu salud fácilmente.</p>

      <div class="segment-selector">
        <button
            :class="{ active: segment === 'diabetic' }"
            @click.prevent="segment = 'diabetic'"
        >
          👩‍⚕️ Persona Diabética
        </button>
        <button
            :class="{ active: segment === 'doctor' }"
            @click.prevent="segment = 'doctor'"
        >
          🩺 Doctor
        </button>
      </div>

      <form @submit.prevent="handleLogin">
        <input v-model="username" type="text" placeholder="Username" required />
        <input v-model="password" type="password" placeholder="Password" required />

        <button type="submit" :disabled="auth.loading">
          <span v-if="auth.loading" class="spinner"></span>
          <span v-else>Login</span>
        </button>

        <div v-if="auth.error" class="error-msg">{{ auth.error }}</div>

        <div class="first-time">
          <router-link to="/auth/register">¿Primera vez? Regístrate</router-link>
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
const password = ref('');
const segment = ref('diabetic');

const handleLogin = async () => {
  await auth.login(username.value, password.value);
  if (auth.user) await router.push('/gluco');
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
  background-color: #ffffff;
  padding: 30px 40px;
  border-radius: 16px;
  width: 400px;
  max-width: 90%;
  text-align: center;
  box-shadow: none;
  border: none;
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
  margin-bottom: 20px;
}

.segment-selector {
  display: flex;
  justify-content: center;
  background: #ffffff;
  border-radius: 12px;
  padding: 6px;
  gap: 6px;
  margin-bottom: 20px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.segment-selector button {
  flex: 1;
  padding: 10px 0;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #325875;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease-in-out;
}

.segment-selector button.active {
  background: #325875;
  color: white;
  box-shadow: 0 2px 8px rgba(50, 88, 117, 0.3);
}

.segment-selector button:hover {
  background: rgba(50, 88, 117, 0.1);
}

/* Inputs */
input {
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border-radius: 8px;
  border: none;
  outline: none;
  background: white;
  color: #1f2a36;
  transition: box-shadow 0.3s ease;
}

input:focus {
  box-shadow: 0 0 0 2px #007ad9;
}

/* Botón Login */
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
  background: #005fa3;
}

/* Enlace */
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
  to {
    transform: rotate(360deg);
  }
}
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
}
.language-container {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 100;
}
.auth-card {
  background-color: #ffffff;
  padding: 30px 40px;
  border-radius: 16px;
  width: 400px;
  max-width: 90%;
  text-align: center;
  box-shadow: none;
  border: none;
}
.logo {
  width: 80px;
  margin-bottom: 10px;
}
</style>
