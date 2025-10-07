<script setup lang="ts">
import { defineProps, defineEmits, reactive, onMounted } from 'vue'
import { useAppointmentStore } from '../../application/appointment.store'
import InputText from 'primevue/inputtext'
import Calendar from 'primevue/calendar'
import Dropdown from 'primevue/dropdown'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import Message from 'primevue/message'

type Appointment = {
  id?: number
  date: string
  time: string
  doctor: string
  specialty: string
  status: string
  notes: string
}

type Doctor = {
  id: number
  name: string
  specialty: string
  available: boolean
}

const props = defineProps<{
  appointment: Appointment | null
  doctors: Doctor[]
}>()

const emit = defineEmits<{
  'saved': []
  'cancelled': []
}>()

const appointmentStore = useAppointmentStore()

const formData = reactive<{
  date: Date | null
  dateString: string
  time: string
  doctorId: number | null
  doctor: string
  specialty: string
  status: string
  notes: string
}>({
  date: null,
  dateString: '',
  time: '',
  doctorId: null,
  doctor: '',
  specialty: '',
  status: 'scheduled',
  notes: ''
})

const state = reactive({
  isLoading: false,
  errors: [] as string[],
  availableSlots: [] as string[]
})

const statusOptions = [
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' }
]

const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00'
]

const doctorOptions = props.doctors.map(doctor => ({
  label: `Dr. ${doctor.name} (${doctor.specialty})`,
  value: doctor.id,
  doctor: doctor
}))

const onDoctorChange = (doctorId: number) => {
  const selectedDoctor = props.doctors.find(d => d.id === doctorId)
  if (selectedDoctor) {
    formData.doctor = selectedDoctor.name
    formData.specialty = selectedDoctor.specialty
    
    // Load available slots if date is selected
    if (formData.date) {
      loadAvailableSlots(doctorId, formatDate(formData.date))
    }
  }
}

const onDateChange = (date: Date) => {
  if (formData.doctorId && date) {
    loadAvailableSlots(formData.doctorId, formatDate(date))
  }
}

const onDateStringChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  formData.dateString = target.value
  if (target.value) {
    formData.date = new Date(target.value)
    if (formData.doctorId) {
      loadAvailableSlots(formData.doctorId, target.value)
    }
  } else {
    formData.date = null
  }
}

const loadAvailableSlots = async (doctorId: number, date: string) => {
  try {
    await appointmentStore.loadAvailableSlots(doctorId, date)
    state.availableSlots = appointmentStore.state.availableSlots
  } catch (error) {
    console.error('Failed to load available slots:', error)
    state.availableSlots = timeSlots // Fallback to all slots
  }
}

const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0]
}

const validateForm = (): boolean => {
  state.errors = []
  
  if (!formData.dateString) {
    state.errors.push('Date is required')
  }
  
  if (!formData.time) {
    state.errors.push('Time is required')
  }
  
  if (!formData.doctorId) {
    state.errors.push('Doctor is required')
  }
  
  return state.errors.length === 0
}

const saveAppointment = async () => {
  if (!validateForm()) return
  
  state.isLoading = true
  state.errors = []
  
  try {
    const appointmentData = {
      date: formData.dateString,
      time: formData.time,
      doctor: formData.doctor,
      specialty: formData.specialty,
      status: formData.status,
      notes: formData.notes
    }
    
    if (props.appointment?.id) {
      // Update existing appointment
      await appointmentStore.updateAppointment(props.appointment.id, appointmentData)
    } else {
      // Create new appointment
      await appointmentStore.createAppointment(appointmentData)
    }
    
    emit('saved')
  } catch (error) {
    console.error('Failed to save appointment:', error)
    state.errors.push('Failed to save appointment. Please try again.')
  } finally {
    state.isLoading = false
  }
}

const cancel = () => {
  emit('cancelled')
}

// Initialize form with appointment data if editing
onMounted(() => {
  if (props.appointment) {
    formData.dateString = props.appointment.date
    formData.date = props.appointment.date ? new Date(props.appointment.date) : null
    formData.time = props.appointment.time
    formData.doctor = props.appointment.doctor
    formData.specialty = props.appointment.specialty
    formData.status = props.appointment.status
    formData.notes = props.appointment.notes
    
    // Find doctor ID
    const doctor = props.doctors.find(d => d.name === props.appointment?.doctor)
    if (doctor) {
      formData.doctorId = doctor.id
    }
  }
})
</script>

<template>
  <div class="appointment-form">
    <!-- Error Messages -->
    <div v-if="state.errors.length > 0" class="mb-3">
      <Message 
        v-for="error in state.errors" 
        :key="error"
        severity="error" 
        :closable="false"
      >
        {{ error }}
      </Message>
    </div>

    <div class="form-grid">
      <!-- Date Field -->
      <div class="field mb-3">
        <label for="appointmentDate" class="block mb-2 font-semibold">Date *</label>
        <InputText
          id="appointmentDate"
          v-model="formData.dateString"
          type="date"
          :min="new Date().toISOString().split('T')[0]"
          placeholder="Select date"
          class="w-full"
          @input="onDateStringChange"
        />
      </div>

      <!-- Time Field -->
      <div class="field mb-3">
        <label for="appointmentTime" class="block mb-2 font-semibold">Time *</label>
        <Dropdown
          id="appointmentTime"
          v-model="formData.time"
          :options="state.availableSlots.length > 0 ? state.availableSlots : timeSlots"
          placeholder="Select time"
          class="w-full"
        />
      </div>

      <!-- Doctor Field -->
      <div class="field mb-3">
        <label for="appointmentDoctor" class="block mb-2 font-semibold">Doctor *</label>
        <Dropdown
          id="appointmentDoctor"
          v-model="formData.doctorId"
          :options="doctorOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Select doctor"
          class="w-full"
          @change="onDoctorChange"
        />
      </div>

      <!-- Specialty Field (Read-only) -->
      <div class="field mb-3">
        <label for="appointmentSpecialty" class="block mb-2 font-semibold">Specialty</label>
        <InputText
          id="appointmentSpecialty"
          v-model="formData.specialty"
          placeholder="Specialty will be auto-filled"
          readonly
          class="w-full"
        />
      </div>

      <!-- Status Field -->
      <div class="field mb-3">
        <label for="appointmentStatus" class="block mb-2 font-semibold">Status</label>
        <Dropdown
          id="appointmentStatus"
          v-model="formData.status"
          :options="statusOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Select status"
          class="w-full"
        />
      </div>

      <!-- Notes Field -->
      <div class="field mb-3">
        <label for="appointmentNotes" class="block mb-2 font-semibold">Notes</label>
        <Textarea
          id="appointmentNotes"
          v-model="formData.notes"
          placeholder="Additional notes (optional)"
          :rows="3"
          class="w-full"
        />
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="form-actions flex justify-content-end gap-2 mt-4">
      <Button
        label="Cancel"
        severity="secondary"
        @click="cancel"
        :disabled="state.isLoading"
      />
      <Button
        :label="props.appointment ? 'Update' : 'Create'"
        severity="primary"
        @click="saveAppointment"
        :loading="state.isLoading"
      />
    </div>
  </div>
</template>

<style scoped>
.appointment-form {
  padding: 1rem;
}

.form-grid {
  display: grid;
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
}

.form-actions {
  border-top: 1px solid #e2e8f0;
  padding-top: 1rem;
  margin-top: 1rem;
}

/* Form styling */
:deep(.p-inputtext),
:deep(.p-dropdown),
:deep(.p-calendar),
:deep(.p-inputtextarea) {
  border-radius: 6px;
  background-color: #ffffff;
  border: 1px solid #d1d5db;
  color: #1f2937;
}

:deep(.p-inputtext:focus),
:deep(.p-dropdown:focus),
:deep(.p-calendar:focus-within),
:deep(.p-inputtextarea:focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

:deep(.p-dropdown-panel) {
  background-color: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

:deep(.p-dropdown-item) {
  color: #1f2937;
}

:deep(.p-dropdown-item:hover) {
  background-color: #f3f4f6;
}

:deep(.p-calendar-panel) {
  background-color: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

/* Labels */
label {
  color: #374151;
  font-weight: 600;
  font-size: 0.875rem;
}

/* Required field indicator */
label:after {
  content: '';
}

/* Message styling */
:deep(.p-message) {
  margin-bottom: 0.5rem;
}

:deep(.p-message-error) {
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
}

/* Button styling */
:deep(.p-button) {
  border-radius: 6px;
  font-weight: 600;
  border: none;
  padding: 0.75rem 1.5rem;
}

:deep(.p-button-primary) {
  background-color: #3b82f6;
  color: #ffffff;
}

:deep(.p-button-secondary) {
  background-color: #6b7280;
  color: #ffffff;
}
</style>