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
        <RouterLink to="/profile">
          <i class="pi pi-user"></i>
          <span v-if="!collapsed">{{ t('sidebar.profile') }}</span>
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
      </nav>
    </aside>

    <div class="main">
      <header class="header">
        <div class="spacer"></div>
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
import { useI18n } from "vue-i18n";
import LanguageSwitcher from "./language-switcher.vue";

const { t } = useI18n();
const collapsed = ref(false);
const toggleSidebar = () => {
  collapsed.value = !collapsed.value;
};
</script>
<style scoped>
.layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.sidenav {
  width: 220px;
  background-color: #1f2a36;
  color: white;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
}

.sidenav.collapsed {
  width: 70px;
}

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

.menu a.router-link-active {
  background: #2d3c4f;
}

.menu a:hover {
  background: #2d3c4f;
  color: #fff;
}

.menu i {
  font-size: 1.2rem;
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f5f6fa;
}

.header {
  height: 60px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.spacer {
  flex: 1;
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}
</style>
