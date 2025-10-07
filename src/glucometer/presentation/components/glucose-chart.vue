<template>
  <div class="chart-container">
    <h3>{{ title }}</h3>
    <Line v-if="chartDataObject" :data="chartDataObject" :options="chartOptions" />
    <div v-else class="placeholder-chart">
      <p>Cargando datos del gráfico...</p>
    </div>
  </div>
</template>

<script>
import { Line } from 'vue-chartjs';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default {
  name: 'GlucoseChart',
  components: {
    Line
  },
  props: {
    title: {
      type: String,
      required: true
    },
    chartData: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            suggestedMin: 100,
            suggestedMax: 180
          }
        }
      }
    };
  },
  computed: {
    chartDataObject() {
      if (!this.chartData || this.chartData.length === 0) {
        return null;
      }
      return {
        labels: this.chartData.map(d => d.day),
        datasets: [
          {
            label: 'Glucosa',
            backgroundColor: '#1a73e8',
            borderColor: '#1a73e8',
            data: this.chartData.map(d => d.value),
            tension: 0.4,
            fill: false
          }
        ]
      };
    }
  }
};
</script>

<style scoped>
.chart-container {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  height: 300px;
}
h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-weight: 600;
}
.placeholder-chart {
    background-color: #f0f4f8;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    color: #666;
}
</style>