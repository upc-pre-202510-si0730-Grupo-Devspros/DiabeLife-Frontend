<template>
  <div class="container mt-4">
    <div v-if="auth.user">
      <h3><strong>{{ auth.user.username }}</strong> Profile</h3>
      <p><strong>Email:</strong> {{ auth.user.email }}</p>
      <button class="btn btn-danger" @click="logout">Logout</button>
    </div>
    <div v-else>
      <p>No user logged in.</p>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { useAuthStore } from "@/userManagment/application/user.store.js";

const router = useRouter();
const auth = useAuthStore();

const logout = () => {
  auth.logout();
  router.push("/login");
};
</script>
