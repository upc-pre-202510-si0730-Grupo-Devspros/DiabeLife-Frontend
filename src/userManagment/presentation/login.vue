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
      <h2>¡Bienvenido a Diabelife!</h2>
      <p class="welcome-text">Controla tu diabetes y gestiona tu salud fácilmente.</p>

      <!-- Segmento decorativo -->
      <div class="segment-selector">
        <button :class="{ active: segment === 'diabetic' }" @click.prevent="segment='diabetic'">Persona Diabética</button>
        <button :class="{ active: segment === 'doctor' }" @click.prevent="segment='doctor'">Doctor</button>
      </div>

      <!-- Formulario -->
      <form @submit.prevent="handleLogin">
        <input v-model="username" type="text" placeholder="Username" required />
        <input v-model="password" type="password" placeholder="Password" required />

        <button type="submit" :disabled="auth.loading">
          <span v-if="auth.loading" class="spinner"></span>
          <span v-else>Login</span>
        </button>

        <div v-if="auth.error" class="error-msg">{{ auth.error }}</div>

        <div class="first-time">
          <router-link to="/auth/register">Primera vez? Regístrate</router-link>
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
  if (auth.user) router.push('/profile');
};
</script>
<style scoped>
.auth-page {
display: flex;
justify-content: center;
align-items: center;
height: 100vh;
background-color: #E9F5FE; /* 🔹 Color uniforme para todo el fondo */
font-family: 'Arial', sans-serif;
}

/* Tarjeta sin otro color: misma tonalidad que el fondo */
.auth-card {
background-color: #E9F5FE; /* 🔹 igual que el fondo */
padding: 30px 40px;
border-radius: 16px;
width: 400px;
max-width: 90%;
text-align: center;
box-shadow: none; /* 🔹 sin sombra */
border: none; /* 🔹 sin borde */
}

/* Logo */
.logo {
width: 80px;
margin-bottom: 10px;
}

/* Título y texto */
h2 {
margin-bottom: 5px;
color: #1f2a36; /* 🔹 texto oscuro */
}

.welcome-text {
font-size: 0.9rem;
color: #333;
margin-bottom: 15px;
}

/* Segmento decorativo */
.segment-selector {
display: flex;
justify-content: center;
gap: 10px;
margin-bottom: 15px;
}

.segment-selector button {
flex: 1;
padding: 8px 0;
border-radius: 8px;
border: 1px solid #007ad9;
background: white;
color: #007ad9;
cursor: pointer;
transition: all 0.2s;
}

.segment-selector button.active,
.segment-selector button:hover {
background: #007ad9;
color: white;
}

/* Inputs */
input {
width: 100%;
padding: 10px;
margin-bottom: 15px;
border-radius: 8px;
border: none;
outline: none;
background: white; /* 🔹 blanco para que destaque del celeste */
color: #1f2a36;
transition: box-shadow 0.3s ease;
}

input:focus {
box-shadow: 0 0 0 2px #007ad9; /* 🔹 borde suave al hacer focus */
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

/* Enlace de registro */
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

/* Mensaje de error */
.error-msg {
color: #d9534f; /* 🔹 rojo suave para error */
margin-top: 10px;
font-size: 0.85rem;
}

/* Spinner */
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