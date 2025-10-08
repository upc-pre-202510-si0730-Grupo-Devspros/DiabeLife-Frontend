<template>
  <div class="layout">
    <aside :class="['sidenav', { collapsed }]">
      <div class="logo-container" @click="toggleSidebar">
        <img
            src="https://i.postimg.cc/c4Cdqjtg/Whats-App-Image-2025-10-01-at-13-53-49-removebg-preview.png"
            alt="Logo"
            class="logo"
        />
        <span v-if="!collapsed" class="logo-text">Diabelife</span>
      </div>

      <nav class="menu">
        <RouterLink to="/gluco">
          <i class="pi pi-heart"></i>
          <span v-if="!collapsed">{{ t('sidebar.glucometer') }}</span>
        </RouterLink>

        <RouterLink to="/healthy">
          <i class="pi pi-apple"></i>
          <span v-if="!collapsed">{{ t('sidebar.healthy') }}</span>
        </RouterLink>
        <RouterLink to="/community">
          <i class="pi pi-users"></i>
          <span v-if="!collapsed">{{ t('sidebar.community') }}</span>
        </RouterLink>
        <RouterLink to="/appointments">
          <i class="pi pi-calendar"></i>
          <span v-if="!collapsed">{{ t('sidebar.appointments') }}</span>
        </RouterLink>
        <RouterLink to="/notifications">
          <i class="pi pi-bell"></i>
          <span v-if="!collapsed">{{ t('sidebar.notifications') }}</span>
        </RouterLink>
        <RouterLink to="/reports">
          <i class="pi pi-chart-line"></i>
          <span v-if="!collapsed">{{ t('sidebar.reports') }}</span>
        </RouterLink>
        <RouterLink to="/profile">
          <i class="pi pi-user"></i>
          <span v-if="!collapsed">{{ t('sidebar.profile') }}</span>
        </RouterLink>
        <button class="logout-btn" @click="handleLogout">
          <i class="pi pi-sign-out"></i>
          <span v-if="!collapsed">{{ t('sidebar.logout') }}</span>
        </button>
      </nav>
    </aside>

    <div class="main">
      <header class="header">
        <div class="spacer"></div>

        <RouterLink to="/notifications" class="notif-icon">
          <i class="pi pi-bell"></i>
        </RouterLink>

        <language-switcher />
      </header>

      <main class="content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import LanguageSwitcher from "./language-switcher.vue";

const router = useRouter();
const { t } = useI18n();
const collapsed = ref(false);

const toggleSidebar = () => {
  collapsed.value = !collapsed.value;
};

const handleLogout = () => {
  localStorage.removeItem("token");
  router.push("/auth/login");
};
</script>

<style scoped>
html, body {
  margin: 0;
  padding: 0;
  overflow-x: hidden; /* evita que aparezca barra lateral o borde fantasma */
  background: #f5f6fa; /* color base del fondo */
}
.layout {
  width: 100vw;
  height: 100vh;
  display: flex;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

/* SIDENAV */
.sidenav {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 220px;
  background-color: #1f2a36;
  color: white;
  display: flex;
  flex-direction: column;
  border: none;
  outline: none;
  box-shadow: none;
  transition: width 0.3s ease;
  z-index: 10;
}

.sidenav.collapsed {
  width: 70px;
}

/* LOGO */
.logo-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem 0;
  cursor: pointer;
}

.logo {
  width: 100px;
  transition: width 0.3s;
}

.sidenav.collapsed .logo {
  width: 50px;
}

.logo-text {
  margin-top: 0.5rem;
  font-size: 1.2rem;
  font-weight: bold;
  color: #f8f9fa;
}

/* MENU */
.menu {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem 0.5rem;
}

.menu a {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  color: #cfd8dc;
  text-decoration: none;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background 0.2s;
}

.menu a.router-link-active,
.menu a:hover {
  background: #2d3c4f;
  color: #fff;
}

/* LOGOUT BUTTON */
.logout-btn {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  color: #ff6b6b;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  padding: 0.5rem;
  margin-top: auto;
  font-size: 1rem;
  border-radius: 6px;
  width: 100%;
  transition: background 0.2s, color 0.2s;
}

.logout-btn:hover {
  background: #2d3c4f;
  color: #fff;
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 220px;
  height: 100vh;
  background: #f5f6fa;
  border: none;
  outline: none;
  box-shadow: none;
  overflow: hidden; /* evita bordes por scroll */
}

.sidenav.collapsed ~ .main {
  margin-left: 70px;
}

/* HEADER */
.header {
  height: 60px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 1rem;
  box-shadow: none; /* 🔹 sin sombra */
  border: none; /* 🔹 sin borde */
  gap: 1rem;
}

.spacer {
  flex: 1;
}

.notif-icon {
  color: #1f2a36;
  font-size: 1.4rem;
  cursor: pointer;
  transition: color 0.2s;
}

.notif-icon:hover {
  color: #007ad9;
}

/* CONTENIDO PRINCIPAL */
.content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  border: none;
}

</style>
