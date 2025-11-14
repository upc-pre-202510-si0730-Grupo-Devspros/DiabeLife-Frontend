
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
      console.log('Load appointments - raw response:', response.data)
      const appointments = Array.isArray(response.data) 
        ? response.data.map(toAppointmentResource)
        : []
      console.log('Load appointments - processed appointments:', appointments)
      state.appointments.splice(0, state.appointments.length, ...appointments)
      console.log('Load appointments - appointments in state:', state.appointments.length)
    } catch (error) {
      console.error('Failed to load appointments:', error)
    } finally {
      state.isLoading = false
    }
  }

  const loadDoctors = async () => {
    // Using local doctors data since the API endpoint is not yet implemented
    const fallbackDoctors = [
      { id: 1, name: 'García', specialty: 'General', available: true },
      { id: 2, name: 'López', specialty: 'Cardiology', available: true },
      { id: 3, name: 'Martínez', specialty: 'Dermatology', available: true },
      { id: 4, name: 'Torres', specialty: 'Neurology', available: true },
      { id: 5, name: 'Ramos', specialty: 'Pediatrics', available: true }
    ]
    state.doctors.splice(0, state.doctors.length, ...fallbackDoctors)
    
    // TODO: Uncomment when doctors API endpoint is available
    /*
    try {
      const response = await api.getDoctors()
      const doctors = Array.isArray(response.data)
        ? response.data.map(toDoctorResource)
        : []
      state.doctors.splice(0, state.doctors.length, ...doctors)
    } catch (error) {
      console.info('Using default doctors list (doctors API endpoint not available)')
    }
    */
  }

  const createAppointment = async (appointmentData) => {
    state.isLoading = true
    try {
      console.log('Creating appointment with data:', appointmentData)
      const payload = toAppointmentRequest(appointmentData)
      console.log('Payload being sent:', payload)
      
      console.log('Making API call...')
      const response = await api.createAppointment(payload)
      console.log('API call successful!')
      console.log('Full response object:', response)
      console.log('Response status:', response.status)
      console.log('Response data:', response.data)
      
      if (!response.data) {
        console.warn('Response data is empty or null')
        throw new Error('Empty response from server')
      }
      
      const newAppointment = toAppointmentResource(response.data)
      console.log('Processed appointment:', newAppointment)
      
      state.appointments.push(newAppointment)
      console.log('Appointment added to state. Total appointments:', state.appointments.length)
      
      return newAppointment
    } catch (error) {
      console.error('Failed to create appointment:', error)
      if (error.response) {
        console.error('Response status:', error.response.status)
        console.error('Response data:', error.response.data)
        console.error('Response data (stringified):', JSON.stringify(error.response.data, null, 2))
        console.error('Response headers:', error.response.headers)
      } else if (error.request) {
        console.error('Request was made but no response received:', error.request)
      } else {
        console.error('Error setting up request:', error.message)
      }
      throw error
    } finally {
      state.isLoading = false
      console.log('Create appointment operation completed, isLoading:', state.isLoading)
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

  // New endpoint methods
  const loadAppointmentsByPatient = async (patientId) => {
    state.isLoading = true
    try {
      const response = await api.getAppointmentsByPatient(patientId)
      const appointments = Array.isArray(response.data) 
        ? response.data.map(toAppointmentResource)
        : []
      return appointments
    } catch (error) {
      console.error('Failed to load appointments by patient:', error)
      throw error
    } finally {
      state.isLoading = false
    }
  }

  const loadAppointmentsByDoctor = async (doctorId) => {
    state.isLoading = true
    try {
      const response = await api.getAppointmentsByDoctor(doctorId)
      const appointments = Array.isArray(response.data) 
        ? response.data.map(toAppointmentResource)
        : []
      return appointments
    } catch (error) {
      console.error('Failed to load appointments by doctor:', error)
      throw error
    } finally {
      state.isLoading = false
    }
  }

  const loadAppointmentsByStatus = async (status) => {
    state.isLoading = true
    try {
      const response = await api.getAppointmentsByStatus(status)
      const appointments = Array.isArray(response.data) 
        ? response.data.map(toAppointmentResource)
        : []
      return appointments
    } catch (error) {
      console.error('Failed to load appointments by status:', error)
      throw error
    } finally {
      state.isLoading = false
    }
  }

  const loadUpcomingAppointments = async () => {
    state.isLoading = true
    try {
      const response = await api.getUpcomingAppointments()
      const appointments = Array.isArray(response.data) 
        ? response.data.map(toAppointmentResource)
        : []
      return appointments
    } catch (error) {
      console.error('Failed to load upcoming appointments:', error)
      throw error
    } finally {
      state.isLoading = false
    }
  }

  const updateAppointmentStatus = async (id, status) => {
    state.isLoading = true
    try {
      const response = await api.updateAppointmentStatus(id, status)
      const updatedAppointment = toAppointmentResource(response.data)
      
      const index = state.appointments.findIndex(apt => apt.id === id)
      if (index !== -1) {
        state.appointments[index] = { ...state.appointments[index], status }
      }
      return updatedAppointment
    } catch (error) {
      console.error('Failed to update appointment status:', error)
      throw error
    } finally {
      state.isLoading = false
    }
  }

  const addAppointmentNotes = async (id, notes) => {
    state.isLoading = true
    try {
      const response = await api.addAppointmentNotes(id, notes)
      const updatedAppointment = toAppointmentResource(response.data)
      
      const index = state.appointments.findIndex(apt => apt.id === id)
      if (index !== -1) {
        state.appointments[index] = { ...state.appointments[index], notes }
      }
      return updatedAppointment
    } catch (error) {
      console.error('Failed to add appointment notes:', error)
      throw error
    } finally {
      state.isLoading = false
    }
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
    
    // New endpoint methods
    loadAppointmentsByPatient,
    loadAppointmentsByDoctor,
    loadAppointmentsByStatus,
    loadUpcomingAppointments,
    updateAppointmentStatus,
    addAppointmentNotes,
    
    // Utilities
    formatAppointmentDateTime,
    formatAppointmentDate,
    formatAppointmentTime
  }
})