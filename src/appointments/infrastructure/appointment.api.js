import axios from 'axios'

// Using Vite proxy to connect with the deployed backend
const BASE_API = import.meta.env.VITE_PLATFORM_API_URL + '/v1'

// Auth header helper
const getAuthHeader = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  if (user && user.accessToken) {
    return { Authorization: `Bearer ${user.accessToken}` }
  }
  return {}
}

export default {
  // Main Appointments CRUD endpoints
  getAppointments() {
    return axios.get(`${BASE_API}/Appointments`, {
      headers: getAuthHeader()
    })
  },
  createAppointment(payload) {
    return axios.post(`${BASE_API}/Appointments`, payload, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      }
    })
  },
  getAppointmentById(id) {
    return axios.get(`${BASE_API}/Appointments/${id}`, {
      headers: getAuthHeader()
    })
  },
  updateAppointment(id, payload) {
    return axios.put(`${BASE_API}/Appointments/${id}`, payload, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      }
    })
  },
  deleteAppointment(id) {
    return axios.delete(`${BASE_API}/Appointments/${id}`, {
      headers: getAuthHeader()
    })
  },

  // Query endpoints
  getAppointmentsByPatient(patientId) {
    return axios.get(`${BASE_API}/Appointments/patient/${patientId}`, {
      headers: getAuthHeader()
    })
  },
  getAppointmentsByDoctor(doctorId) {
    return axios.get(`${BASE_API}/Appointments/doctor/${doctorId}`, {
      headers: getAuthHeader()
    })
  },
  getAppointmentsByDate(date) {
    return axios.get(`${BASE_API}/Appointments/date/${date}`, {
      headers: getAuthHeader()
    })
  },
  getAppointmentsByStatus(status) {
    return axios.get(`${BASE_API}/Appointments/status/${status}`, {
      headers: getAuthHeader()
    })
  },
  getUpcomingAppointments() {
    return axios.get(`${BASE_API}/Appointments/upcoming`, {
      headers: getAuthHeader()
    })
  },

  // Partial update endpoints
  updateAppointmentStatus(id, status) {
    return axios.patch(`${BASE_API}/Appointments/${id}/status`, { status }, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      }
    })
  },
  addAppointmentNotes(id, notes) {
    return axios.patch(`${BASE_API}/Appointments/${id}/notes`, { notes }, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      }
    })
  },

  // Legacy methods - keeping compatibility for existing code
  getDoctors() {
    return axios.get(`${BASE_API}/doctors`, {
      headers: getAuthHeader()
    })
  },
  getDoctorById(id) {
    return axios.get(`${BASE_API}/doctors/${id}`, {
      headers: getAuthHeader()
    })
  },
  getAvailableSlots(doctorId, date) {
    return axios.get(`${BASE_API}/available-slots`, {
      params: { doctorId, date },
      headers: getAuthHeader()
    })
  }
}
