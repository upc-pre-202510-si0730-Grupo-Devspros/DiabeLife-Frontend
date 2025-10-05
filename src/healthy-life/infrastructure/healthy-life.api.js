import axios from 'axios'

const BASE = 'http://localhost:3000'

export default {
  getHealthy() {
    return axios.get(`${BASE}/healthy`)
  },
  createHealthy(payload) {
    return axios.post(`${BASE}/healthy`, payload)
  },
  updateHealthy(id, payload) {
    return axios.put(`${BASE}/healthy/${id}`, payload)
  },
  getRecommendations() {
    return axios.get(`${BASE}/recommendations`)
  },
  getFoodData() {
    return axios.get(`${BASE}/foodData`)
  },
  createFoodData(payload) {
    return axios.post(`${BASE}/foodData`, payload)
  }
}
