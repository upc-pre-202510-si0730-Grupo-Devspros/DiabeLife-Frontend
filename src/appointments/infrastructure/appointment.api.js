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

// Google Calendar Integration (Optional)
class GoogleCalendarSync {
  static gapi = null;
  static isEnabled = false;
  static isInitialized = false;
  
  static async initialize() {
    // Only initialize if Google Calendar is enabled and credentials are available
    if (!import.meta.env.VITE_GOOGLE_CALENDAR_API_KEY || !import.meta.env.VITE_GOOGLE_CLIENT_ID) {
      console.log('Google Calendar sync disabled - missing credentials');
      return false;
    }
    
    try {
      if (!window.gapi) {
        await this.loadGoogleAPIScript();
      }
      
      await new Promise(resolve => window.gapi.load('client:auth2', resolve));
      
      await window.gapi.client.init({
        apiKey: import.meta.env.VITE_GOOGLE_CALENDAR_API_KEY,
        clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
        scope: 'https://www.googleapis.com/auth/calendar'
      });
      
      this.gapi = window.gapi;
      this.isInitialized = true;
      this.isEnabled = true;
      console.log('Google Calendar sync initialized successfully');
      return true;
    } catch (error) {
      console.warn('Google Calendar sync initialization failed:', error);
      this.isEnabled = false;
      return false;
    }
  }
  
  static async loadGoogleAPIScript() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  
  static async ensureSignedIn() {
    if (!this.isEnabled || !this.gapi) return false;
    
    const authInstance = this.gapi.auth2.getAuthInstance();
    if (!authInstance.isSignedIn.get()) {
      try {
        await authInstance.signIn();
        return true;
      } catch (error) {
        console.warn('Google Calendar sign-in failed:', error);
        return false;
      }
    }
    return true;
  }
  
  static async syncAppointmentToGoogle(appointment) {
    if (!this.isEnabled || !await this.ensureSignedIn()) return null;
    
    try {
      const event = {
        summary: appointment.title || `Cita médica - ${appointment.doctor}`,
        description: this.buildDescription(appointment),
        start: {
          dateTime: new Date(`${appointment.date}T${appointment.time}`).toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        end: {
          dateTime: new Date(new Date(`${appointment.date}T${appointment.time}`).getTime() + 30 * 60000).toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        location: 'Clínica DiabeLife'
      };
      
      const response = await this.gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: event
      });
      
      console.log('Appointment synced to Google Calendar:', response.result.id);
      return response.result.id; // Return Google Calendar event ID
    } catch (error) {
      console.warn('Failed to sync appointment to Google Calendar:', error);
      return null;
    }
  }
  
  static async updateGoogleEvent(googleEventId, appointment) {
    if (!this.isEnabled || !await this.ensureSignedIn() || !googleEventId) return;
    
    try {
      const event = {
        summary: appointment.title || `Cita médica - ${appointment.doctor}`,
        description: this.buildDescription(appointment),
        start: {
          dateTime: new Date(`${appointment.date}T${appointment.time}`).toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        end: {
          dateTime: new Date(new Date(`${appointment.date}T${appointment.time}`).getTime() + 30 * 60000).toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      };
      
      await this.gapi.client.calendar.events.update({
        calendarId: 'primary',
        eventId: googleEventId,
        resource: event
      });
      
      console.log('Google Calendar event updated:', googleEventId);
    } catch (error) {
      console.warn('Failed to update Google Calendar event:', error);
    }
  }
  
  static async deleteGoogleEvent(googleEventId) {
    if (!this.isEnabled || !await this.ensureSignedIn() || !googleEventId) return;
    
    try {
      await this.gapi.client.calendar.events.delete({
        calendarId: 'primary',
        eventId: googleEventId
      });
      
      console.log('Google Calendar event deleted:', googleEventId);
    } catch (error) {
      console.warn('Failed to delete Google Calendar event:', error);
    }
  }
  
  static buildDescription(appointment) {
    return [
      `Doctor: ${appointment.doctor || 'No especificado'}`,
      `Especialidad: ${appointment.specialty || 'No especificado'}`,
      `Estado: ${appointment.status || 'scheduled'}`,
      appointment.notes ? `Notas: ${appointment.notes}` : ''
    ].filter(line => line).join('\n');
  }
}

// Initialize Google Calendar sync on module load
GoogleCalendarSync.initialize();

export default {
  // Main Appointments CRUD endpoints - Backend Primary
  async getAppointments() {
    try {
      const response = await axios.get(`${BASE_API}/Appointments`, {
        headers: getAuthHeader()
      });
      return response;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  },
  
  async createAppointment(payload) {
    try {
      const response = await axios.post(`${BASE_API}/Appointments`, payload, {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        }
      });
      
      // Optional: Sync to Google Calendar
      if (response.data) {
        const googleEventId = await GoogleCalendarSync.syncAppointmentToGoogle(response.data);
        if (googleEventId) {
          // Optionally store googleEventId in the appointment record
          console.log('Appointment synced to Google Calendar:', googleEventId);
        }
      }
      
      return response;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  },
  
  async getAppointmentById(id) {
    try {
      const response = await axios.get(`${BASE_API}/Appointments/${id}`, {
        headers: getAuthHeader()
      });
      return response;
    } catch (error) {
      console.error('Error fetching appointment by ID:', error);
      throw error;
    }
  },
  
  async updateAppointment(id, payload) {
    try {
      const response = await axios.put(`${BASE_API}/Appointments/${id}`, payload, {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        }
      });
      
      // Optional: Update Google Calendar event
      if (response.data && response.data.googleEventId) {
        await GoogleCalendarSync.updateGoogleEvent(response.data.googleEventId, response.data);
      }
      
      return response;
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw error;
    }
  },
  
  async deleteAppointment(id) {
    try {
      // Get appointment first to retrieve Google Calendar event ID if exists
      const appointmentResponse = await this.getAppointmentById(id);
      const googleEventId = appointmentResponse.data?.googleEventId;
      
      const response = await axios.delete(`${BASE_API}/Appointments/${id}`, {
        headers: getAuthHeader()
      });
      
      // Optional: Delete from Google Calendar
      if (googleEventId) {
        await GoogleCalendarSync.deleteGoogleEvent(googleEventId);
      }
      
      return response;
    } catch (error) {
      console.error('Error deleting appointment:', error);
      throw error;
    }
  },

  // Query endpoints
  async getAppointmentsByPatient(patientId) {
    try {
      const response = await axios.get(`${BASE_API}/Appointments/patient/${patientId}`, {
        headers: getAuthHeader()
      });
      return response;
    } catch (error) {
      console.error('Error fetching appointments by patient:', error);
      throw error;
    }
  },
  
  async getAppointmentsByDoctor(doctorId) {
    try {
      const response = await axios.get(`${BASE_API}/Appointments/doctor/${doctorId}`, {
        headers: getAuthHeader()
      });
      return response;
    } catch (error) {
      console.error('Error fetching appointments by doctor:', error);
      throw error;
    }
  },
  
  async getAppointmentsByDate(date) {
    try {
      const response = await axios.get(`${BASE_API}/Appointments/date/${date}`, {
        headers: getAuthHeader()
      });
      return response;
    } catch (error) {
      console.error('Error fetching appointments by date:', error);
      throw error;
    }
  },
  
  async getAppointmentsByStatus(status) {
    try {
      const response = await axios.get(`${BASE_API}/Appointments/status/${status}`, {
        headers: getAuthHeader()
      });
      return response;
    } catch (error) {
      console.error('Error fetching appointments by status:', error);
      throw error;
    }
  },
  
  async getUpcomingAppointments() {
    try {
      const response = await axios.get(`${BASE_API}/Appointments/upcoming`, {
        headers: getAuthHeader()
      });
      return response;
    } catch (error) {
      console.error('Error fetching upcoming appointments:', error);
      throw error;
    }
  },

  // Partial update endpoints
  async updateAppointmentStatus(id, status) {
    try {
      const response = await axios.patch(`${BASE_API}/Appointments/${id}/status`, { status }, {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        }
      });
      return response;
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw error;
    }
  },
  
  async addAppointmentNotes(id, notes) {
    try {
      const response = await axios.patch(`${BASE_API}/Appointments/${id}/notes`, { notes }, {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        }
      });
      return response;
    } catch (error) {
      console.error('Error adding appointment notes:', error);
      throw error;
    }
  },

  // Support methods for doctors and slots
  async getDoctors() {
    try {
      const response = await axios.get(`${BASE_API}/doctors`, {
        headers: getAuthHeader()
      });
      return response;
    } catch (error) {
      console.error('Error fetching doctors:', error);
      // Fallback to default doctors if endpoint not available
      return {
        data: [
          { id: 1, name: 'Dr. García', specialty: 'Endocrinología', available: true },
          { id: 2, name: 'Dr. López', specialty: 'Medicina General', available: true },
          { id: 3, name: 'Dr. Martínez', specialty: 'Nutrición', available: true },
          { id: 4, name: 'Dra. Rodríguez', specialty: 'Cardiología', available: true },
          { id: 5, name: 'Dr. Hernández', specialty: 'Oftalmología', available: true }
        ]
      };
    }
  },
  
  async getDoctorById(id) {
    try {
      const response = await axios.get(`${BASE_API}/doctors/${id}`, {
        headers: getAuthHeader()
      });
      return response;
    } catch (error) {
      console.error('Error fetching doctor by ID:', error);
      throw error;
    }
  },
  
  async getAvailableSlots(doctorId, date) {
    try {
      const response = await axios.get(`${BASE_API}/available-slots`, {
        params: { doctorId, date },
        headers: getAuthHeader()
      });
      return response;
    } catch (error) {
      console.error('Error fetching available slots:', error);
      // Fallback to generated slots if endpoint not available
      const slots = this.generateDefaultSlots(doctorId, date);
      return { data: slots };
    }
  },
  
  // Helper method for generating default slots
  generateDefaultSlots(doctorId, date) {
    const targetDate = date ? new Date(date) : new Date();
    const slots = [];
    
    // Generate morning slots (9:00 AM - 12:00 PM)
    for (let hour = 9; hour < 12; hour++) {
      slots.push({
        id: `${doctorId}-${targetDate.toISOString().split('T')[0]}-${hour}:00`,
        doctorId,
        startTime: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), hour, 0),
        endTime: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), hour, 30),
        available: true
      });
    }
    
    // Generate afternoon slots (2:00 PM - 6:00 PM)
    for (let hour = 14; hour < 18; hour++) {
      slots.push({
        id: `${doctorId}-${targetDate.toISOString().split('T')[0]}-${hour}:00`,
        doctorId,
        startTime: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), hour, 0),
        endTime: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), hour, 30),
        available: true
      });
    }
    
    return slots;
  },
  
  // Google Calendar Sync Control
  async enableGoogleCalendarSync() {
    return await GoogleCalendarSync.initialize();
  },
  
  isGoogleCalendarEnabled() {
    return GoogleCalendarSync.isEnabled;
  },
  
  async signInToGoogleCalendar() {
    return await GoogleCalendarSync.ensureSignedIn();
  }
}
