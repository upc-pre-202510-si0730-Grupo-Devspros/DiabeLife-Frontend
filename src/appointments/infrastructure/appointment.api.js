import axios from 'axios'

// Cambiado al endpoint remoto
const BASE = 'https://fakeapi-diabelife-1.onrender.com'

export default {
  // Appointments CRUD
  getAppointments() {
    return axios.get(`${BASE}/appointments`)
  },
  getAppointmentById(id) {
    return axios.get(`${BASE}/appointments/${id}`)
  },
  createAppointment(payload) {
    return axios.post(`${BASE}/appointments`, payload)
  },
  updateAppointment(id, payload) {
    return axios.put(`${BASE}/appointments/${id}`, payload)
  },
  deleteAppointment(id) {
    return axios.delete(`${BASE}/appointments/${id}`)
  },

  // Doctors
  getDoctors() {
    return axios.get(`${BASE}/doctors`)
  },
  getDoctorById(id) {
    return axios.get(`${BASE}/doctors/${id}`)
  },

  // Available time slots
  getAvailableSlots(doctorId, date) {
    return axios.get(`${BASE}/available-slots`, {
      params: { doctorId, date }
    })
  }
}
