<template>
  <div class="glucometer-dashboard container py-4">
    <!-- Nombre de usuario -->
    <div class="dashboard-header text-center mb-4">
      <h2 class="user-name">{{ auth.user?.username || "Usuario" }}</h2>
      <p class="text-muted">{{ t("glucometer.subtitle") }}</p>
    </div>

    <!-- Contenido principal -->
    <div class="dashboard-grid">
      <div class="left-column">
        <glucose-chart
            :title="t('glucometer.weekChart')"
            :chartData="weeklyData"
        />
        <glucose-chart
            :title="t('glucometer.lastWeekChart')"
            :chartData="lastWeekData"
        />
      </div>

      <div class="right-column">
        <glucose-status v-if="latestMeasurement" :measurement="latestMeasurement" />
        <div v-else class="loading-placeholder">
          <p>{{ t("glucometer.loadingData") }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import GlucoseStatus from "@/glucometer/presentation/components/glucose-status.vue";
import GlucoseChart from "@/glucometer/presentation/components/glucose-chart.vue";
import { useAuthStore } from "@/userManagment/application/user.store.js";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const auth = useAuthStore();

const latestMeasurement = {
  id: 1,
  value: 145,
  unit: "mg/dL",
  status: "High",
  trend: "Rising",
  date: new Date(),
};

const weeklyData = [
  { day: "Mon", value: 110 },
  { day: "Tue", value: 125 },
  { day: "Wed", value: 115 },
  { day: "Thu", value: 130 },
  { day: "Fri", value: 140 },
  { day: "Sat", value: 135 },
  { day: "Sun", value: 145 },
];

const lastWeekData = [
  { day: "Mon", value: 120 },
  { day: "Tue", value: 135 },
  { day: "Wed", value: 145 },
  { day: "Thu", value: 130 },
  { day: "Fri", value: 155 },
  { day: "Sat", value: 140 },
  { day: "Sun", value: 130 },
];
</script>

<style scoped>
.glucometer-dashboard {
  background-color: #f5f6fa;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.05);
}

.dashboard-header {
  border-bottom: 2px solid #e3e7ed;
  padding-bottom: 1rem;
}

.user-name {
  font-size: 1.8rem;
  font-weight: 700;
  color: #325875;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  margin-top: 2rem;
  align-items: start;
}

.left-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.loading-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 250px;
  background-color: #eef3f8;
  border-radius: 15px;
  color: #6c757d;
  font-weight: 500;
  letter-spacing: 0.3px;
}

@media (max-width: 992px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}
</style>
