
import { defineStore } from 'pinia'
import { reactive, computed } from 'vue'
import api from '../infrastructure/appointment.api'
import { 
  toAppointmentResource, 
  toAppointmentRequest, 
  toDoctorResource,
  formatAppointmentDateTime,
  formatAppointmentDate,
  formatAppointmentTime
} from '../infrastructure/appointment.assembler'

export const useAppointmentStore = defineStore('appointments', () => {
  const state = reactive({
    appointments: [],
    doctors: [],
    selectedDate: null,
    selectedAppointment: null,
    isLoading: false,
    availableSlots: [],
    currentMonth: new Date().getMonth(),
    currentYear: new Date().getFullYear()
  })

  // Computed properties
  const appointmentsByDate = computed(() => {
    const grouped = {}
    state.appointments.forEach(appointment => {
      const date = appointment.date
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(appointment)
    })
    return grouped
  })

  const upcomingAppointments = computed(() => {
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    return state.appointments
      .filter(apt => apt.date >= todayStr && apt.status === 'scheduled')
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`)
        const dateB = new Date(`${b.date}T${b.time}`)
        return dateA - dateB
      })
      .slice(0, 5) // Show next 5 appointments
  })

  const appointmentsForSelectedDate = computed(() => {
    if (!state.selectedDate) return []
    return state.appointments.filter(apt => apt.date === state.selectedDate)
  })

  // Actions
  const loadAppointments = async () => {
    state.isLoading = true
    try {
      const response = await api.getAppointments()
      const appointments = Array.isArray(response.data) 
        ? response.data.map(toAppointmentResource)
        : []
      state.appointments.splice(0, state.appointments.length, ...appointments)
    } catch (error) {
      console.error('Failed to load appointments:', error)
    } finally {
      state.isLoading = false
    }
  }

  const loadDoctors = async () => {
    try {
      const response = await api.getDoctors()
      const doctors = Array.isArray(response.data)
        ? response.data.map(toDoctorResource)
        : []
      state.doctors.splice(0, state.doctors.length, ...doctors)
    } catch (error) {
      console.error('Failed to load doctors:', error)
    }
  }

  const createAppointment = async (appointmentData) => {
    state.isLoading = true
    try {
      const payload = toAppointmentRequest(appointmentData)
      const response = await api.createAppointment(payload)
      const newAppointment = toAppointmentResource(response.data)
      state.appointments.push(newAppointment)
      return newAppointment
    } catch (error) {
      console.error('Failed to create appointment:', error)
      throw error
    } finally {
      state.isLoading = false
    }
  }

  const updateAppointment = async (id, appointmentData) => {
    state.isLoading = true
    try {
      const payload = toAppointmentRequest(appointmentData)
      const response = await api.updateAppointment(id, payload)
      const updatedAppointment = toAppointmentResource(response.data)
      
      const index = state.appointments.findIndex(apt => apt.id === id)
      if (index !== -1) {
        state.appointments[index] = updatedAppointment
      }
      return updatedAppointment
    } catch (error) {
      console.error('Failed to update appointment:', error)
      throw error
    } finally {
      state.isLoading = false
    }
  }

  const deleteAppointment = async (id) => {
    state.isLoading = true
    try {
      await api.deleteAppointment(id)
      const index = state.appointments.findIndex(apt => apt.id === id)
      if (index !== -1) {
        state.appointments.splice(index, 1)
      }
    } catch (error) {
      console.error('Failed to delete appointment:', error)
      throw error
    } finally {
      state.isLoading = false
    }
  }

  const loadAvailableSlots = async (doctorId, date) => {
    try {
      const response = await api.getAvailableSlots(doctorId, date)
      const slots = Array.isArray(response.data) ? response.data : []
      state.availableSlots.splice(0, state.availableSlots.length, ...slots)
    } catch (error) {
      console.error('Failed to load available slots:', error)
      state.availableSlots.splice(0, state.availableSlots.length)
    }
  }

  const setSelectedDate = (date) => {
    state.selectedDate = date
  }

  const setSelectedAppointment = (appointment) => {
    state.selectedAppointment = appointment
  }

  const setCurrentMonth = (month, year) => {
    state.currentMonth = month
    state.currentYear = year
  }

  const hasAppointmentOnDate = (date) => {
    return state.appointments.some(apt => apt.date === date)
  }

  const getAppointmentsByDate = (date) => {
    return state.appointments.filter(apt => apt.date === date)
  }

  // Initialize
  const initialize = async () => {
    await Promise.all([
      loadAppointments(),
      loadDoctors()
    ])
  }

  return {
    // State
    state,
    
    // Computed
    appointmentsByDate,
    upcomingAppointments,
    appointmentsForSelectedDate,
    
    // Actions
    loadAppointments,
    loadDoctors,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    loadAvailableSlots,
    setSelectedDate,
    setSelectedAppointment,
    setCurrentMonth,
    hasAppointmentOnDate,
    getAppointmentsByDate,
    initialize,
    
    // Utilities
    formatAppointmentDateTime,
    formatAppointmentDate,
    formatAppointmentTime
  }
})