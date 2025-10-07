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
// Importa los componentes necesarios de Chart.js
import { Line } from 'vue-chartjs';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Registra los componentes de Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default {
  name: 'GlucoseChart',
  components: {
    Line
  },
  props: {
    title: { // <-- Nueva prop para el título
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
      // Opciones de configuración para el gráfico
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false // Oculta la leyenda
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            suggestedMin: 100, // Ajusta el eje Y
            suggestedMax: 180
          }
        }
      }
    };
  },
  computed: {
    // Transforma los datos de la prop al formato que Chart.js necesita
    chartDataObject() {
      if (!this.chartData || this.chartData.length === 0) {
        return null;
      }
      return {
        labels: this.chartData.map(d => d.day), // Eje X: Mon, Tue, etc.
        datasets: [
          {
            label: 'Glucosa',
            backgroundColor: '#1a73e8',
            borderColor: '#1a73e8',
            data: this.chartData.map(d => d.value), // Eje Y: 110, 125, etc.
            tension: 0.4, // Hace la línea más suave
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
  border-radius: 8px; /* Reducido para esquinas más cuadradas */
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08); /* Sombra más sutil */
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