<script setup lang="ts">
import { defineProps } from 'vue'
import { useI18n } from 'vue-i18n'

type Summary = { heartRate: number; glucose: number; weight: number; bloodPressure: string }
const props = defineProps<{ summary: Summary }>()

const s = props.summary || { heartRate: 0, glucose: 0, weight: 0, bloodPressure: '0/0' }
const { t } = useI18n()
</script>

<template>
  <div class="grid">
    <div class="col-6 md:col-3 text-center mb-3">
      <div class="metric-icon heart-icon mb-2"><i class="pi pi-heart-fill"></i></div>
      <div class="metric-label">{{ t('summary.heartRate') }}</div>
      <div class="metric-value">{{ s.heartRate }} bpm</div>
    </div>

    <div class="col-6 md:col-3 text-center mb-3">
      <div class="metric-icon glucose-icon mb-2"><i class="pi pi-chart-line"></i></div>
      <div class="metric-label">{{ t('summary.glucose') }}</div>
      <div class="metric-value">{{ s.glucose }} mg/dL</div>
    </div>

    <div class="col-6 md:col-3 text-center mb-3">
      <div class="metric-icon weight-icon mb-2"><i class="pi pi-chart-bar"></i></div>
      <div class="metric-label">{{ t('summary.weight') }}</div>
      <div class="metric-value">{{ s.weight }} kg</div>
    </div>

    <div class="col-6 md:col-3 text-center mb-3">
      <div class="metric-icon pressure-icon mb-2"><i class="pi pi-arrow-up"></i></div>
      <div class="metric-label">{{ t('summary.bloodPressure') }}</div>
      <div class="metric-value">{{ s.bloodPressure }}</div>
    </div>
  </div>
</template>

<style scoped>
.grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.metric-icon {
  font-size: 2rem;
}

.metric-label {
  font-weight: bold;
  font-size: 1rem;
  color: #333;
}

.metric-value {
  font-size: 1.1rem;
  color: #555;
}

.heart-icon i {
  color: #e74c3c;
}

.glucose-icon i {
  color: #27ae60;
}

.weight-icon i {
  color: #3498db;
}

.pressure-icon i {
  color: #9b59b6;
}
</style>
