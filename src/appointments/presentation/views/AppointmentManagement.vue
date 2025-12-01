<template>
  <div class="appointments-container">
    <!-- Header -->
    <div class="header">
      <h1><i class="pi pi-calendar"></i> {{ $t('appointment.management') }}</h1>
      <p>{{ $t('appointment.subtitle') }}</p>
    </div>

    <!-- Formulario de Nueva Cita -->
    <div class="appointment-form-card">
      <div class="card-header">
        <h2><i class="pi pi-plus"></i> {{ $t('appointment.newAppointment') }}</h2>
      </div>
      <form @submit.prevent="createAppointment" class="appointment-form">
        <div class="form-grid">
          <!-- Columna izquierda -->
          <div class="form-column">
            <div class="form-group">
              <label for="patient">{{ $t('appointment.fields.patient') }} *</label>
              <input 
                id="patient"
                v-model="appointmentForm.patient" 
                type="text" 
                :placeholder="$t('appointment.placeholders.patient')"
                required
              />
            </div>

            <div class="form-group">
              <label for="doctor">{{ $t('appointment.fields.doctor') }} *</label>
              <select id="doctor" v-model="appointmentForm.doctor" required>
                <option value="">{{ $t('appointment.placeholders.doctor') }}</option>
                <option v-for="(doctor, key) in translatedDoctors" :key="key" :value="doctor">
                  {{ doctor }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label for="appointmentType">{{ $t('appointment.fields.appointmentType') }} *</label>
              <select id="appointmentType" v-model="appointmentForm.appointmentType" required>
                <option value="">{{ $t('appointment.placeholders.appointmentType') }}</option>
                <option v-for="(type, key) in translatedAppointmentTypes" :key="key" :value="type">
                  {{ type }}
                </option>
              </select>
            </div>
          </div>

          <!-- Columna derecha -->
          <div class="form-column">
            <div class="form-group">
              <label for="appointmentDate">{{ $t('appointment.fields.date') }} *</label>
              <input 
                id="appointmentDate"
                v-model="appointmentForm.date" 
                type="date" 
                :min="minDate"
                required
              />
            </div>

            <div class="form-group">
              <label for="appointmentTime">{{ $t('appointment.fields.time') }} *</label>
              <select id="appointmentTime" v-model="appointmentForm.time" required>
                <option value="">{{ $t('appointment.placeholders.time') }}</option>
                <option v-for="time in timeSlots" :key="time" :value="time">
                  {{ time }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label for="location">{{ $t('appointment.fields.location') }} *</label>
              <select id="location" v-model="appointmentForm.location" required>
                <option value="">{{ $t('appointment.placeholders.location') }}</option>
                <option v-for="(location, key) in translatedLocations" :key="key" :value="location">
                  {{ location }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Campos completos -->
        <div class="form-group full-width">
          <label for="duration">{{ $t('appointment.fields.duration') }}</label>
          <select id="duration" v-model="appointmentForm.duration">
            <option v-for="(duration, key) in translatedDurations" :key="key" :value="key">
              {{ duration }}
            </option>
          </select>
        </div>

        <div class="form-group full-width">
          <label for="notes">{{ $t('appointment.fields.notes') }}</label>
          <textarea 
            id="notes"
            v-model="appointmentForm.notes" 
            :placeholder="$t('appointment.placeholders.notes')"
            rows="3"
          ></textarea>
        </div>

        <!-- Botones -->
        <div class="form-actions">
          <button type="button" @click="resetForm" class="btn btn-secondary">
            <i class="pi pi-refresh"></i> {{ $t('appointment.clear') }}
          </button>
          <button type="submit" class="btn btn-primary" :disabled="isCreating">
            <i class="pi" :class="isCreating ? 'pi-spin pi-spinner' : 'pi-check'"></i>
            {{ isCreating ? $t('appointment.creating') : $t('appointment.create') }}
          </button>
        </div>
      </form>
    </div>

    <!-- Mensaje de estado -->
    <div v-if="message" class="message-card" :class="messageType">
      <i class="pi" :class="messageIcon"></i>
      <span>{{ message }}</span>
    </div>

    <!-- Lista de Citas -->
    <div v-if="appointments.length > 0" class="appointments-list-card">
      <div class="card-header">
        <h2><i class="pi pi-list"></i> {{ $t('appointment.scheduledAppointments') }} ({{ appointments.length }})</h2>
      </div>
      <div class="appointments-grid">
        <div 
          v-for="appointment in appointments" 
          :key="appointment.id" 
          class="appointment-card"
        >
          <div class="appointment-header">
            <span class="appointment-type">{{ appointment.appointmentType }}</span>
            <span class="appointment-status" :class="getStatusClass(appointment.status)">{{ getTranslatedStatus(appointment.status) }}</span>
          </div>
          <div class="appointment-details">
            <div class="detail-item">
              <i class="pi pi-user"></i>
              <span>{{ appointment.patient }}</span>
            </div>
            <div class="detail-item">
              <i class="pi pi-user-edit"></i>
              <span>{{ appointment.doctor }}</span>
            </div>
            <div class="detail-item">
              <i class="pi pi-calendar"></i>
              <span>{{ appointment.date }}</span>
            </div>
            <div class="detail-item">
              <i class="pi pi-clock"></i>
              <span>{{ appointment.time }}</span>
            </div>
            <div v-if="appointment.location" class="detail-item">
              <i class="pi pi-map-marker"></i>
              <span>{{ appointment.location }}</span>
            </div>
          </div>
          <div v-if="appointment.notes" class="appointment-notes">
            <i class="pi pi-file-edit"></i>
            <span>{{ appointment.notes }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const { t } = useI18n()
const message = ref('')
const messageType = ref('info')
const isCreating = ref(false)
const appointments = ref([])

// URLs de backend - usar proxy existente en desarrollo
const isDev = import.meta.env.DEV
const backendUrl = ref(
  isDev 
    ? '/api' // Usar proxy existente en desarrollo
    : 'https://diabelife-backend-3.onrender.com/api' // URL directa en producción
)

console.log('📍 Backend URL:', backendUrl.value)

// Formulario de cita
const appointmentForm = ref({
  patient: '',
  doctor: '',
  appointmentType: '',
  date: '',
  time: '',
  location: '',
  duration: 30,
  notes: ''
})

// Datos para selectores - mantenemos timeSlots para funcionalidad
const timeSlots = ref([
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30'
])

// Computed
const minDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

const messageIcon = computed(() => {
  switch(messageType.value) {
    case 'success': return 'pi-check-circle'
    case 'error': return 'pi-times-circle'
    case 'warning': return 'pi-exclamation-triangle'
    default: return 'pi-info-circle'
  }
})

// Traducciones computadas
const translatedDoctors = computed(() => ({
  maria: t('appointment.doctors.maria'),
  carlos: t('appointment.doctors.carlos'),
  elena: t('appointment.doctors.elena'),
  jose: t('appointment.doctors.jose'),
  carmen: t('appointment.doctors.carmen'),
  miguel: t('appointment.doctors.miguel'),
  garcia: t('appointment.doctors.garcia')
}))

const translatedAppointmentTypes = computed(() => ({
  consultation: t('appointment.types.consultation'),
  specialized: t('appointment.types.specialized'),
  emergency: t('appointment.types.emergency'),
  treatmentReview: t('appointment.types.treatmentReview'),
  followUp: t('appointment.types.followUp'),
  initial: t('appointment.types.initial'),
  general: t('appointment.types.general')
}))

const translatedLocations = computed(() => ({
  office1: t('appointment.locations.office1'),
  office2: t('appointment.locations.office2'),
  office3: t('appointment.locations.office3'),
  emergency: t('appointment.locations.emergency'),
  lab: t('appointment.locations.lab'),
  procedures: t('appointment.locations.procedures'),
  mainClinic: t('appointment.locations.mainClinic')
}))

const translatedDurations = computed(() => ({
  15: t('appointment.durations.15'),
  30: t('appointment.durations.30'),
  45: t('appointment.durations.45'),
  60: t('appointment.durations.60'),
  90: t('appointment.durations.90'),
  120: t('appointment.durations.120')
}))

// Funciones
const getStatusClass = (status) => {
  if (!status) return 'scheduled'
  const statusLower = status.toLowerCase()
  if (statusLower.includes('scheduled') || statusLower.includes('programada')) return 'scheduled'
  if (statusLower.includes('completed') || statusLower.includes('completada')) return 'completed'
  if (statusLower.includes('cancelled') || statusLower.includes('cancelada')) return 'cancelled'
  return 'scheduled'
}

const getTranslatedStatus = (status) => {
  if (!status) return t('appointment.status.scheduled')
  const statusLower = status.toLowerCase()
  if (statusLower.includes('scheduled') || statusLower.includes('programada')) {
    return t('appointment.status.scheduled')
  }
  if (statusLower.includes('completed') || statusLower.includes('completada')) {
    return t('appointment.status.completed')
  }
  if (statusLower.includes('cancelled') || statusLower.includes('cancelada')) {
    return t('appointment.status.cancelled')
  }
  return t('appointment.status.scheduled')
}

const resetForm = () => {
  appointmentForm.value = {
    patient: '',
    doctor: '',
    appointmentType: '',
    date: '',
    time: '',
    location: '',
    duration: 30,
    notes: ''
  }
  message.value = ''
}

const setMessage = (text, type = 'info') => {
  message.value = text
  messageType.value = type
  setTimeout(() => {
    if (message.value === text) {
      message.value = ''
    }
  }, 5000)
}

const loadAppointments = async () => {
  try {
    const response = await fetch(`${backendUrl.value}/v1/Appointments`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      appointments.value = data.map(item => ({
        id: item.id,
        patient: item.patient,
        doctor: item.doctor,
        appointmentType: item.appointmentType,
        date: item.appointmentDate?.split('T')[0] || 'Sin fecha',
        time: item.appointmentDate?.split('T')[1]?.substring(0,5) || 'Sin hora',
        location: item.location,
        duration: item.duration,
        status: item.status || 'Programada',
        notes: item.notes
      }))
      
      console.log('✅ Citas cargadas:', appointments.value.length)
    }
  } catch (error) {
    console.error('Error cargando citas:', error)
  }
}

const createAppointment = async () => {
  if (isCreating.value) return
  
  isCreating.value = true
  setMessage('Creando cita...', 'info')
  
  try {
    // Crear objeto de fecha y hora
    const appointmentDateTime = new Date(`${appointmentForm.value.date}T${appointmentForm.value.time}:00`)
    
    const appointmentData = {
      appointmentDate: appointmentDateTime.toISOString(),
      doctor: appointmentForm.value.doctor,
      patient: appointmentForm.value.patient,
      appointmentType: appointmentForm.value.appointmentType,
      location: appointmentForm.value.location,
      duration: parseInt(appointmentForm.value.duration),
      notes: appointmentForm.value.notes
    }
    
    console.log('📝 Creando cita:', appointmentData)
    
    const response = await fetch(`${backendUrl.value}/v1/Appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(appointmentData)
    })
    
    if (response.ok) {
      const result = await response.json()
      console.log('✅ Cita creada:', result)
      
      setMessage(`¡Cita creada exitosamente! ID: ${result.id}`, 'success')
      resetForm()
      await loadAppointments() // Recargar la lista
      
    } else {
      const errorText = await response.text()
      console.error('❌ Error:', response.status, errorText)
      setMessage(`Error al crear la cita: ${response.status}`, 'error')
    }
    
  } catch (error) {
    console.error('❌ Error de red:', error)
    setMessage(`Error de conexión: ${error.message}`, 'error')
  } finally {
    isCreating.value = false
  }
}



// Cargar citas al montar el componente
onMounted(() => {
  loadAppointments()
})
</script>

<style scoped>
/* Variables CSS */
:root {
  --primary-color: #3498db;
  --secondary-color: #2c3e50;
  --success-color: #27ae60;
  --warning-color: #f39c12;
  --error-color: #e74c3c;
  --info-color: #17a2b8;
  --background-color: #f8f9fa;
  --card-background: #ffffff;
  --border-color: #dee2e6;
  --text-color: #2c3e50;
  --text-muted: #6c757d;
  --shadow: 0 2px 10px rgba(0,0,0,0.1);
  --shadow-hover: 0 4px 20px rgba(0,0,0,0.15);
  --border-radius: 8px;
  --transition: all 0.3s ease;
}

/* Contenedor principal */
.appointments-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: var(--background-color);
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: var(--text-color);
}

/* Header */
.header {
  text-align: center;
  margin-bottom: 30px;
  padding: 30px;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
}

.header h1 {
  margin: 0 0 10px 0;
  font-size: 2.5rem;
  font-weight: 700;
}

.header h1 i {
  margin-right: 15px;
}

.header p {
  margin: 0;
  font-size: 1.1rem;
  opacity: 0.9;
}

/* Card base */
.appointment-form-card,
.appointments-list-card {
  background: var(--card-background);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  margin-bottom: 30px;
  overflow: hidden;
  transition: var(--transition);
}

.appointment-form-card:hover,
.appointments-list-card:hover {
  box-shadow: var(--shadow-hover);
}

.card-header {
  padding: 20px;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  border-bottom: 1px solid var(--border-color);
  border-radius: 8px 8px 0 0;
}

.card-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.card-header i {
  margin-right: 10px;
}

/* Formulario */
.appointment-form {
  padding: 30px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 20px;
}

.form-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group.full-width {
  margin-bottom: 20px;
}

.form-group label {
  font-weight: 600;
  color: var(--secondary-color);
  font-size: 0.9rem;
  margin-bottom: 5px;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 12px 16px;
  border: 2px solid var(--border-color);
  border-radius: 6px;
  font-size: 1rem;
  transition: var(--transition);
  background: white;
  color: var(--text-color);
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: #6c757d;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

/* Botones */
.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-decoration: none;
  position: relative;
  overflow: hidden;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
}

.btn:active {
  transform: translateY(0);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-primary {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #059669, #047857);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
}

.btn-secondary {
  background: linear-gradient(135deg, #9ca3af, #6b7280);
  color: white;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: linear-gradient(135deg, #6b7280, #4b5563);
}



.form-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}

/* Mensaje */
.message-card {
  padding: 15px 20px;
  border-radius: var(--border-radius);
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
  box-shadow: var(--shadow);
  animation: fadeIn 0.3s ease-out;
}

.message-card.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message-card.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.message-card.warning {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.message-card.info {
  background: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
}

/* Lista de citas */
.appointments-grid {
  display: grid;
  gap: 20px;
  padding: 20px;
}

.appointment-card {
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 20px;
  transition: var(--transition);
  animation: fadeIn 0.3s ease-out;
  color: var(--text-color);
}

.appointment-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
}

.appointment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.appointment-type {
  font-weight: 600;
  font-size: 1.1rem;
  color: var(--secondary-color);
}

.appointment-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.appointment-status.scheduled {
  background: #e3f2fd;
  color: #1565c0;
}

.appointment-status.completed {
  background: #e8f5e8;
  color: #2e7d32;
}

.appointment-status.cancelled {
  background: #ffebee;
  color: #d32f2f;
}

.appointment-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
  margin-bottom: 10px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-color);
  font-size: 0.9rem;
}

.detail-item i {
  color: var(--primary-color);
  width: 16px;
}

.appointment-notes {
  background: #f8f9fa;
  padding: 10px 15px;
  border-radius: 6px;
  margin-top: 10px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-style: italic;
  color: var(--text-color);
}

/* Responsive */
@media (max-width: 768px) {
  .appointments-container {
    padding: 10px;
  }
  
  .header {
    padding: 20px;
  }
  
  .header h1 {
    font-size: 2rem;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .appointment-details {
    grid-template-columns: 1fr;
  }
}

/* Animaciones */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* PrimeIcons integration */
.pi {
  font-family: 'primeicons';
}

/* Correcciones de contraste - Forzar colores */
.appointments-container {
  color: #2c3e50 !important;
}

.appointments-container * {
  color: inherit;
}

.appointments-container input,
.appointments-container select,
.appointments-container textarea {
  color: #2c3e50 !important;
  background: white !important;
}

.appointments-container label {
  color: #2c3e50 !important;
}

.appointment-card {
  color: #2c3e50 !important;
}

.appointment-card * {
  color: inherit !important;
}

.detail-item {
  color: #2c3e50 !important;
}

.appointment-type {
  color: #2c3e50 !important;
}
</style>