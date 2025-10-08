/**
 * API Service
 * Provides methods to interact with the backend API for managing appointments, doctors, and available time slots.
 * Uses Axios to perform HTTP requests to the specified base URL.
 * @module ApiService
 *
 * @constant {string} BASE - The base URL of the API.
 *
 * @function getAppointments
 * @description Retrieves the list of all appointments.
 * @returns {Promise} Axios promise resolving to the list of appointments.
 *
 * @function getAppointmentById
 * @description Retrieves details of a specific appointment by its ID.
 * @param {number} id - The unique identifier of the appointment.
 * @returns {Promise} Axios promise resolving to the appointment data.
 *
 * @function createAppointment
 * @description Creates a new appointment record.
 * @param {Object} payload - The appointment data to be created.
 * @returns {Promise} Axios promise resolving to the created appointment.
 *
 * @function updateAppointment
 * @description Updates an existing appointment by its ID.
 * @param {number} id - The unique identifier of the appointment.
 * @param {Object} payload - The updated appointment data.
 * @returns {Promise} Axios promise resolving to the updated appointment.
 *
 * @function deleteAppointment
 * @description Deletes an appointment by its ID.
 * @param {number} id - The unique identifier of the appointment.
 * @returns {Promise} Axios promise resolving when the deletion is successful.
 *
 * @function getDoctors
 * @description Retrieves the list of all doctors.
 * @returns {Promise} Axios promise resolving to the list of doctors.
 *
 * @function getDoctorById
 * @description Retrieves details of a specific doctor by their ID.
 * @param {number} id - The unique identifier of the doctor.
 * @returns {Promise} Axios promise resolving to the doctor data.
 *
 * @function getAvailableSlots
 * @description Retrieves available time slots for a specific doctor on a given date.
 * @param {number} doctorId - The unique identifier of the doctor.
 * @param {string} date - The date to check availability for (YYYY-MM-DD).
 * @returns {Promise} Axios promise resolving to the list of available slots.
 *
 * @example
 * import ApiService from './apiService';
 *
 * // Fetch all appointments
 * ApiService.getAppointments().then(response => {
 *   console.log(response.data);
 * });
 */

import axios from 'axios'

const BASE = 'http://localhost:3000'

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