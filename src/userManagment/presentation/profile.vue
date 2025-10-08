<template>
  <div class="profile-page d-flex justify-content-center align-items-center min-vh-100">
    <div class="card shadow-lg p-4 rounded-4 profile-card text-center">
      <div class="profile-header">
        <img
            src="https://cdn-icons-png.flaticon.com/512/3177/3177440.png"
            alt="User Avatar"
            class="profile-avatar mb-3"
        />
        <h3 class="fw-bold text-dark mb-0">{{ auth.user.username }}</h3>
        <small class="text-muted">{{ t("profile.userProfile") }}</small>
      </div>

      <hr class="my-4" />

      <div class="info-section text-start px-3">
        <div class="info-item">
          <span class="label">
            <i class="bi bi-envelope-fill me-2 text-primary"></i>{{ t("profile.email") }}:
          </span>
          <span class="value">{{ auth.user.email }}</span>
        </div>

        <div class="info-item">
          <span class="label">
            <i class="bi bi-lock-fill me-2 text-primary"></i>{{ t("profile.password") }}:
          </span>
          <span class="value">********</span>
        </div>
      </div>

      <button class="btn logout-btn mt-4 w-100 fw-bold" @click="logout">
        <i class="bi bi-box-arrow-right me-2"></i> {{ t("profile.logout") }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { useAuthStore } from "@/userManagment/application/user.store.js";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const router = useRouter();
const auth = useAuthStore();

const logout = () => {
  auth.logout();
  router.push("/login");
};
</script>

<style scoped>
.profile-page {
  background: linear-gradient(135deg, #f5f6fa, #f5f6fa);
}

.profile-card {
  max-width: 420px;
  background-color: #f5f6fa;
  border: none;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.profile-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.profile-avatar {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  border: 3px solid #007bff33;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.profile-avatar:hover {
  transform: scale(1.05);
}

.profile-header h3 {
  font-size: 1.4rem;
}

.info-section {
  font-size: 1rem;
}

.info-item {
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
}

.label {
  font-weight: 600;
  color: #444;
}

.value {
  color: #6c757d;
}

.logout-btn {
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 0.75rem;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background-color: #b02a37;
  transform: scale(1.03);
}
</style>
