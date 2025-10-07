<template>
  <div class="glucometer-dashboard">
    <h2 class="user-name">Leonardo Morales</h2>

    <div class="dashboard-grid">
      <div class="left-column">
        <glucose-chart
          title="Charts of the week"
          :chartData="weeklyData"
        />
        <glucose-chart
          title="Charts of the last week"
          :chartData="lastWeekData"
        />
      </div>

      <div class="right-column">
        <glucose-status v-if="latestMeasurement" :measurement="latestMeasurement" />
        <div v-else class="loading-placeholder">
          <p>Cargando datos de la medición...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import GlucoseStatus from '@/glucometer/presentation/components/glucose-status.vue';
import GlucoseChart from '@/glucometer/presentation/components/glucose-chart.vue';

export default {
  name: 'GlucometerDashboard',
  components: {
    GlucoseStatus,
    GlucoseChart
  },
  data() {
    return {
      
      latestMeasurement: {
        id: 1,
        value: 145,
        unit: 'mg/dL',
        status: 'High',
        trend: '1 Rising',
        date: new Date()
      },
      weeklyData: [
        { day: 'Mon', value: 110 },
        { day: 'Tue', value: 125 },
        { day: 'Wed', value: 115 },
        { day: 'Thu', value: 130 },
        { day: 'Fri', value: 140 },
        { day: 'Sat', value: 135 },
        { day: 'Sun', value: 145 },
      ],
      lastWeekData: [
        { day: 'Mon', value: 120 },
        { day: 'Tue', value: 135 },
        { day: 'Wed', value: 145 },
        { day: 'Thu', value: 130 },
        { day: 'Fri', value: 155 },
        { day: 'Sat', value: 140 },
        { day: 'Sun', value: 130 },
      ]
    };
  }
};
</script>

<style scoped>
.user-name {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
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
  height: 100%;
  min-height: 200px;
  background-color: #f0f4f8;
  border-radius: 15px;
  color: #666;
}
@media (max-width: 992px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}
</style>