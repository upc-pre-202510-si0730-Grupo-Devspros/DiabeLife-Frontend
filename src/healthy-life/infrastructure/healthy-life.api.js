import axios from 'axios'

// Usando el proxy de Vite para conectar con el backend real
const BASE_API = '/api/v1'

export default {
  // Dashboard endpoints
  getDashboardData() {
    return axios.get(`${BASE_API}/Healthy/dashboard`)
  },
  getHealthSummary() {
    return axios.get(`${BASE_API}/Healthy/summary`)
  },

  // Health Metrics endpoints
  getHealthMetrics() {
    return axios.get(`${BASE_API}/HealthMetrics`)
  },
  getLatestHealthMetric() {
    return axios.get(`${BASE_API}/HealthMetrics/latest`)
  },
  createHealthMetric(payload) {
    return axios.post(`${BASE_API}/HealthMetrics`, payload)
  },
  updateHealthMetric(id, payload) {
    return axios.put(`${BASE_API}/HealthMetrics/${id}`, payload)
  },
  deleteHealthMetric(id) {
    return axios.delete(`${BASE_API}/HealthMetrics/${id}`)
  },
  getHealthMetricById(id) {
    return axios.get(`${BASE_API}/HealthMetrics/${id}`)
  },

  // Recommendations endpoints
  getRecommendations() {
    return axios.get(`${BASE_API}/Recommendations`)
  },
  createRecommendation(payload) {
    return axios.post(`${BASE_API}/Recommendations`, payload)
  },
  updateRecommendation(id, payload) {
    return axios.put(`${BASE_API}/Recommendations/${id}`, payload)
  },
  deleteRecommendation(id) {
    return axios.delete(`${BASE_API}/Recommendations/${id}`)
  },
  getRecommendationById(id) {
    return axios.get(`${BASE_API}/Recommendations/${id}`)
  },

  // Food Data endpoints
  getFoodData() {
    return axios.get(`${BASE_API}/FoodData`)
  },
  getRecentFoodData() {
    return axios.get(`${BASE_API}/FoodData/recent`)
  },
  createFoodData(payload) {
    return axios.post(`${BASE_API}/FoodData`, payload)
  },
  updateFoodData(id, payload) {
    return axios.put(`${BASE_API}/FoodData/${id}`, payload)
  },
  deleteFoodData(id) {
    return axios.delete(`${BASE_API}/FoodData/${id}`)
  },
  getFoodDataById(id) {
    return axios.get(`${BASE_API}/FoodData/${id}`)
  },

  // Legacy methods - mantenemos compatibilidad
  getHealthy() {
    return this.getLatestHealthMetric()
  },
  createHealthy(payload) {
    return this.createHealthMetric(payload)
  },
  updateHealthy(id, payload) {
    return this.updateHealthMetric(id, payload)
  }
}
