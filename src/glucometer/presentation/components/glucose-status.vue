<template>
  <div class="glucose-status-card">
    <div class="header">
      <span>{{ t('glucometer.date') }}: {{ formattedDate }}</span>
      <span>{{ t('glucometer.hour') }}: {{ formattedTime }}</span>
    </div>
    <div class="measurement">
      <h1>{{ measurement.value }}</h1>
      <span>{{ measurement.unit }}</span>
    </div>
    <div class="status" :class="statusClass">{{ translatedStatus }}</div>
    <div class="trend">{{ t('glucometer.trend') }}: {{ measurement.trend }}</div>
    <button class="add-button">{{ t('glucometer.addMeasurement') }}</button>
  </div>
</template>

<script>
import { useI18n } from 'vue-i18n'

export default {
  name: 'GlucoseStatus',
  props: {
    measurement: {
      type: Object,
      required: true
    }
  },
  setup() {
    const { t } = useI18n()
    return { t }
  },
  computed: {
    formattedDate() {
      return this.measurement.date ? new Intl.DateTimeFormat('en-US').format(this.measurement.date) : '';
    },
    formattedTime() {
      return this.measurement.date ? this.measurement.date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '';
    },
    statusClass() {
      if (!this.measurement.status) return '';
      return `status-${this.measurement.status.toLowerCase()}`;
    },
    translatedStatus() {
      if (!this.measurement.status) return '';
      const statusKey = this.measurement.status.toLowerCase();
      return this.t(`glucometer.status.${statusKey}`);
    }
  }
};
</script>

<style scoped>
.glucose-status-card {
  background-color: #f0f4f8;
  border-radius: 15px;
  padding: 2.5rem; 
  text-align: center;
  max-width: 450px; 
  min-height: 620px; 
  margin: 0 auto;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  font-family: sans-serif;
  display: flex;
  flex-direction: column;
  justify-content: space-between; 
}
.header {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #666;
}
.measurement {
  display: flex;
  justify-content: center;
  align-items: baseline;
  color: #333;
}
.measurement h1 {
  font-size: 6rem; 
  margin: 0;
  color: #1a73e8;
}
.measurement span {
  font-size: 1.8rem; 
  margin-left: 0.5rem;
  font-weight: bold;
}
.status {
  font-size: 1.8rem; 
  font-weight: bold;
  margin: 0.5rem 0;
}
.status-high { color: #d93025; }
.status-normal { color: #1e8e3e; }
.status-low { color: #f9ab00; }

.trend {
  font-size: 1.4rem; 
  color: #555;
  margin-bottom: 1rem;
}
.add-button {
  background-color: #1a73e8;
  color: white;
  border: none;
  padding: 1.2rem 2.5rem; 
  border-radius: 30px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}
.add-button:hover {
  background-color: #1765c4;
}
</style>