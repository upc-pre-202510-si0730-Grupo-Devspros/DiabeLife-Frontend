<script setup lang="ts">
import { defineProps } from 'vue'
type Summary = { heartRate: number; glucose: number; weight: number; bloodPressure: string }
const props = defineProps<{ summary: Summary }>()
const s = props.summary || { heartRate: 0, glucose: 0, weight: 0, bloodPressure: '0/0' }
</script>

<template>
  <div class="grid">
    <div class="col-6 md:col-3 text-center mb-3">
      <div class="metric-icon heart-icon mb-2"><i class="pi pi-heart-fill"></i></div>
      <div class="metric-label">Heart Rate</div>
      <div class="metric-value">{{ s.heartRate }} bpm</div>
    </div>
    <div class="col-6 md:col-3 text-center mb-3">
      <div class="metric-icon glucose-icon mb-2"><i class="pi pi-chart-line"></i></div>
      <div class="metric-label">Glucose</div>
      <div class="metric-value">{{ s.glucose }} mg/dL</div>
    </div>
    <div class="col-6 md:col-3 text-center mb-3">
      <div class="metric-icon weight-icon mb-2"><i class="pi pi-chart-bar"></i></div>
      <div class="metric-label">Weight</div>
      <div class="metric-value">{{ s.weight }} kg</div>
    </div>
    <div class="col-6 md:col-3 text-center mb-3">
      <div class="metric-icon pressure-icon mb-2"><i class="pi pi-arrow-up"></i></div>
      <div class="metric-label">Blood Pressure</div>
      <div class="metric-value">{{ s.bloodPressure }}</div>
    </div>
  </div>
</template>

<style scoped>
</style>
