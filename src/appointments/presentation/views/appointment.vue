<script setup lang="ts">
import { reactive, onMounted, onUnmounted, computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAppointmentStore } from '../../application/appointment.store'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Message from 'primevue/message'

const appointmentStore = useAppointmentStore()
const { t } = useI18n()

// Reference to the calendar container
const calendarRef = ref<HTMLElement | null>(null)

type Appointment = {
  id?: number
  date: string
  time: string
  doctor: string
  specialty: string
  status: string
  notes: string
}

const state = reactive({
  showAddDialog: false,
  showEditDialog: false,
  selectedDate: null as string | null,
  selectedAppointment: null as Appointment | null,
  currentMonth: new Date().getMonth(),
  currentYear: new Date().getFullYear(),
  // Form data
  newAppointment: {
    date: '',
    time: '',
    doctor: '',
    notes: ''
  }
})

// Available time slots for appointments
const availableTimeSlots = computed(() => [
  { label: t('appointment.times.08:00'), value: '08:00' },
  { label: t('appointment.times.08:30'), value: '08:30' },
  { label: t('appointment.times.09:00'), value: '09:00' },
  { label: t('appointment.times.09:30'), value: '09:30' },
  { label: t('appointment.times.10:00'), value: '10:00' },
  { label: t('appointment.times.10:30'), value: '10:30' },
  { label: t('appointment.times.11:00'), value: '11:00' },
  { label: t('appointment.times.11:30'), value: '11:30' },
  { label: t('appointment.times.12:00'), value: '12:00' },
  { label: t('appointment.times.12:30'), value: '12:30' },
  { label: t('appointment.times.13:00'), value: '13:00' },
  { label: t('appointment.times.13:30'), value: '13:30' },
  { label: t('appointment.times.14:00'), value: '14:00' },
  { label: t('appointment.times.14:30'), value: '14:30' },
  { label: t('appointment.times.15:00'), value: '15:00' },
  { label: t('appointment.times.15:30'), value: '15:30' },
  { label: t('appointment.times.16:00'), value: '16:00' },
  { label: t('appointment.times.16:30'), value: '16:30' },
  { label: t('appointment.times.17:00'), value: '17:00' },
  { label: t('appointment.times.17:30'), value: '17:30' }
])

// Available doctors
const availableDoctors = computed(() => [
  { label: t('appointment.doctors.ramos'), value: 'Ramos' },
  { label: t('appointment.doctors.garcia'), value: 'García' },
  { label: t('appointment.doctors.lopez'), value: 'López' },
  { label: t('appointment.doctors.martinez'), value: 'Martínez' },
  { label: t('appointment.doctors.torres'), value: 'Torres' }
])

const monthNames = computed(() => [
  t('calendar.months.january'),
  t('calendar.months.february'),
  t('calendar.months.march'),
  t('calendar.months.april'),
  t('calendar.months.may'),
  t('calendar.months.june'),
  t('calendar.months.july'),
  t('calendar.months.august'),
  t('calendar.months.september'),
  t('calendar.months.october'),
  t('calendar.months.november'),
  t('calendar.months.december')
])

const weekDays = computed(() => [
  t('calendar.weekdays.s'),
  t('calendar.weekdays.m'),
  t('calendar.weekdays.t'),
  t('calendar.weekdays.w'),
  t('calendar.weekdays.th'),
  t('calendar.weekdays.f'),
  t('calendar.weekdays.sa')
])

const currentMonthName = computed(() => {
  return `${monthNames.value[state.currentMonth]} ${state.currentYear}`
})

const calendarDays = computed(() => {
  const firstDay = new Date(state.currentYear, state.currentMonth, 1)
  const lastDay = new Date(state.currentYear, state.currentMonth + 1, 0)
  const firstDayOfWeek = firstDay.getDay()
  const daysInMonth = lastDay.getDate()
  
  const days = []
  
  // Add days from previous month
  for (let i = 0; i < firstDayOfWeek; i++) {
    const prevDate = new Date(state.currentYear, state.currentMonth, -(firstDayOfWeek - 1 - i))
    const dateStr = formatDate(prevDate)
    const dayAppointments = appointmentStore.state.appointments.filter(apt => apt.date === dateStr)
    
    days.push({
      day: prevDate.getDate(),
      date: dateStr,
      isCurrentMonth: false,
      hasAppointment: dayAppointments.length > 0,
      appointments: dayAppointments,
      isSelected: false, // Never pre-select dates
      isToday: isToday(prevDate),
      isSunday: prevDate.getDay() === 0
    })
  }
  
  // Add days of current month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(state.currentYear, state.currentMonth, day)
    const dateStr = formatDate(date)
    const dayAppointments = appointmentStore.state.appointments.filter(apt => apt.date === dateStr)
    
    days.push({
      day,
      date: dateStr,
      isCurrentMonth: true,
      hasAppointment: dayAppointments.length > 0,
      appointments: dayAppointments,
      isSelected: state.selectedDate === dateStr,
      isToday: isToday(date),
      isSunday: date.getDay() === 0
    })
  }
  
  // Add days from next month to complete the grid (42 days = 6 weeks)
  const remainingDays = 42 - days.length
  for (let i = 1; i <= remainingDays; i++) {
    const nextDate = new Date(state.currentYear, state.currentMonth + 1, i)
    const dateStr = formatDate(nextDate)
    const dayAppointments = appointmentStore.state.appointments.filter(apt => apt.date === dateStr)
    
    days.push({
      day: nextDate.getDate(),
      date: dateStr,
      isCurrentMonth: false,
      hasAppointment: dayAppointments.length > 0,
      appointments: dayAppointments,
      isSelected: false, // Never pre-select dates
      isToday: isToday(nextDate),
      isSunday: nextDate.getDay() === 0
    })
  }
  
  return days
})

const upcomingAppointments = computed(() => {
  return appointmentStore.state.appointments
    .filter(apt => apt.status === 'scheduled')
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`)
      const dateB = new Date(`${b.date}T${b.time}`)
      return dateA.getTime() - dateB.getTime()
    })
})

const selectedDateAppointments = computed(() => {
  if (!state.selectedDate) return []
  return appointmentStore.state.appointments.filter(apt => apt.date === state.selectedDate)
})

const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0]
}

const isToday = (date: Date): boolean => {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

const formatAppointmentDate = (dateStr: string): string => {
  try {
    // Parse the date components directly to avoid timezone issues
    const [year, month, day] = dateStr.split('-').map(Number)
    const date = new Date(year, month - 1, day) // month is 0-based in Date constructor
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: '2-digit'
    })
  } catch {
    return dateStr
  }
}

const formatAppointmentTime = (timeStr: string): string => {
  try {
    const [hours, minutes] = timeStr.split(':')
    const date = new Date()
    date.setHours(parseInt(hours), parseInt(minutes))
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  } catch {
    return timeStr
  }
}

const onDateClick = (day: any) => {
  // Allow selection of any day (current month or not)
  state.selectedDate = day.date
  
  // If clicking on a day from another month, navigate to that month
  if (!day.isCurrentMonth) {
    const clickedDate = new Date(day.date)
    state.currentMonth = clickedDate.getMonth()
    state.currentYear = clickedDate.getFullYear()
  }
}

// Function to handle clicks outside the calendar
const handleClickOutside = (event: MouseEvent) => {
  if (calendarRef.value && !calendarRef.value.contains(event.target as Node)) {
    // Clear the selected date when clicking outside the calendar
    state.selectedDate = null
  }
}

const previousMonth = () => {
  if (state.currentMonth === 0) {
    state.currentMonth = 11
    state.currentYear--
  } else {
    state.currentMonth--
  }
}

const nextMonth = () => {
  if (state.currentMonth === 11) {
    state.currentMonth = 0
    state.currentYear++
  } else {
    state.currentMonth++
  }
}

const goToToday = () => {
  const today = new Date()
  state.currentMonth = today.getMonth()
  state.currentYear = today.getFullYear()
  state.selectedDate = formatDate(today)
}

const onAddAppointment = () => {
  state.selectedAppointment = null
  // Reset form
  state.newAppointment = {
    date: state.selectedDate || '',
    time: '',
    doctor: '',
    notes: ''
  }
  state.showAddDialog = true
}

// Function to check for appointment conflicts
const hasTimeConflict = (date: string, time: string, excludeId?: number): boolean => {
  return appointmentStore.state.appointments.some(appointment => {
    // Skip the appointment being edited (for edit mode)
    if (excludeId && appointment.id === excludeId) {
      return false
    }
    
    // Check if same date and time
    return appointment.date === date && appointment.time === time && appointment.status === 'scheduled'
  })
}

const onEditAppointment = (appointment: Appointment) => {
  state.selectedAppointment = appointment
  state.newAppointment = {
    date: appointment.date,
    time: appointment.time,
    doctor: appointment.doctor,
    notes: appointment.notes
  }
  state.showEditDialog = true
}

const saveAppointment = async () => {
  if (!state.newAppointment.date || !state.newAppointment.time || !state.newAppointment.doctor) {
    alert(t('appointment.fillRequiredFields'))
    return
  }

  // Check for time conflicts
  const excludeId = state.showEditDialog && state.selectedAppointment ? state.selectedAppointment.id : undefined
  if (hasTimeConflict(state.newAppointment.date, state.newAppointment.time, excludeId)) {
    alert(t('appointment.timeConflict', {
      date: formatAppointmentDate(state.newAppointment.date),
      time: formatAppointmentTime(state.newAppointment.time)
    }))
    return
  }

  try {
    console.log('Saving appointment with data:', state.newAppointment)
    
    if (state.showEditDialog && state.selectedAppointment) {
      // Update existing appointment
      console.log('Updating existing appointment...')
      const result = await appointmentStore.updateAppointment(state.selectedAppointment.id!, {
        date: state.newAppointment.date,
        time: state.newAppointment.time,
        doctor: state.newAppointment.doctor,
        specialty: 'General',
        status: 'scheduled',
        notes: state.newAppointment.notes || 'Updated appointment',
        // Add required fields
        patient: 'Current Patient',
        location: 'Main Clinic',
        appointmentType: 'Consultation'
      })
      console.log('Update result:', result)
    } else {
      // Create new appointment
      console.log('Creating new appointment...')
      const result = await appointmentStore.createAppointment({
        date: state.newAppointment.date,
        time: state.newAppointment.time,
        doctor: state.newAppointment.doctor,
        specialty: 'General',
        status: 'scheduled',
        notes: state.newAppointment.notes || 'Scheduled appointment',
        // Add required fields
        patient: 'Current Patient', // This should be dynamic based on logged user
        location: 'Main Clinic',
        appointmentType: 'Consultation'
      })
      console.log('Create result:', result)
    }

    console.log('Appointment saved successfully!')
    alert('Appointment saved successfully!')

    // Close dialogs and reset form
    state.showAddDialog = false
    state.showEditDialog = false
    state.newAppointment = { date: '', time: '', doctor: '', notes: '' }
    state.selectedAppointment = null
    
    console.log('Form reset and dialogs closed')
  } catch (error) {
    console.error('Error saving appointment:', error)
    
    let errorMessage = t('appointment.errorSaving')
    
    if (error.response) {
      console.error('HTTP Error:', error.response.status, error.response.data)
      if (error.response.status === 400) {
        errorMessage = 'Invalid appointment data. Please check all fields.'
      } else if (error.response.status === 401) {
        errorMessage = 'Authentication required. Please log in again.'
      } else if (error.response.status === 404) {
        errorMessage = 'Appointment service not found.'
      } else if (error.response.status >= 500) {
        errorMessage = 'Server error. Please try again later.'
      }
    } else if (error.request) {
      console.error('Network Error:', error.request)
      errorMessage = 'Network error. Please check your connection.'
    }
    
    alert(errorMessage)
  }
}

const cancelDialog = () => {
  state.showAddDialog = false
  state.showEditDialog = false
  state.newAppointment = { date: '', time: '', doctor: '', notes: '' }
}

const deleteAppointment = async (appointment: Appointment) => {
  if (appointment.id && confirm(t('appointment.confirmDelete'))) {
    try {
      await appointmentStore.deleteAppointment(appointment.id)
    } catch (error) {
      console.error('Error deleting appointment:', error)
      alert(t('appointment.errorDeleting'))
    }
  }
}

onMounted(async () => {
  // Initialize store when component mounts
  await appointmentStore.initialize()
  
  // Add event listener for clicks outside the calendar
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  // Remove event listener when component is unmounted
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="appointments-page">
    <div class="appointments-layout">
      <!-- Calendar Section -->
      <div class="calendar-section">
        <Card class="calendar-card">
          <template #title>
            <span>{{ t('appointment.calendar') }}</span>
          </template>
          <template #content>
            <!-- Dynamic Calendar -->
            <div class="calendar-container" ref="calendarRef">
              <!-- Calendar Header -->
              <div class="calendar-header">
                <Button 
                  icon="pi pi-chevron-left" 
                  severity="secondary" 
                  text 
                  @click="previousMonth"
                  size="small"
                />
                <h3 class="calendar-title">{{ currentMonthName }}</h3>
                <Button 
                  icon="pi pi-chevron-right" 
                  severity="secondary" 
                  text 
                  @click="nextMonth"
                  size="small"
                />
              </div>

              <!-- Calendar Grid -->
              <div class="calendar-grid">
                <!-- Week Days Header -->
                <div class="calendar-weekdays">
                  <div 
                    v-for="(day, index) in weekDays" 
                    :key="day" 
                    class="calendar-weekday"
                    :class="{ 'calendar-weekday-sunday': index === 0 }"
                  >
                    {{ day }}
                  </div>
                </div>

                <!-- Calendar Days -->
                <div class="calendar-days">
                  <div 
                    v-for="day in calendarDays" 
                    :key="`${day.date}-${day.day}`"
                    class="calendar-day"
                    :class="{
                      'calendar-day-current': day.isCurrentMonth,
                      'calendar-day-other': !day.isCurrentMonth,
                      'calendar-day-today': day.isToday,
                      'calendar-day-selected': day.isSelected,
                      'calendar-day-has-appointment': day.hasAppointment,
                      'calendar-day-sunday': day.isSunday
                    }"
                    @click="onDateClick(day)"
                  >
                    <div class="calendar-day-number">{{ day.day }}</div>
                    <div v-if="day.hasAppointment" class="calendar-appointment-indicator">
                      <!-- Show up to 4 dots, or 3 dots + "..." if more than 4 appointments -->
                      <template v-if="day.appointments.length <= 4">
                        <div 
                          v-for="(appointment, index) in day.appointments" 
                          :key="`${day.date}-${index}`"
                          class="appointment-dot"
                        ></div>
                      </template>
                      <template v-else>
                        <div 
                          v-for="index in 3" 
                          :key="`${day.date}-${index}`"
                          class="appointment-dot"
                        ></div>
                        <div class="appointment-more">...</div>
                      </template>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- Appointments List Section -->
      <div class="appointments-section">
        <Card class="appointments-card">
          <template #title>{{ t('appointment.appointments') }}</template>
          <template #content>
            <div class="appointment-list">
              <!-- Sample appointments -->
              <div 
                v-for="appointment in upcomingAppointments" 
                :key="appointment.id"
                class="appointment-item"
                @click="onEditAppointment(appointment)"
              >
                <div class="appointment-info">
                  <div class="appointment-date-time">
                    {{ formatAppointmentDate(appointment.date) }} - {{ formatAppointmentTime(appointment.time) }} Dr. {{ appointment.doctor }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Divider line between general appointments and selected date appointments -->
            <div v-if="state.selectedDate && selectedDateAppointments.length > 0" class="appointment-divider"></div>

            <!-- Selected Date Appointments -->
            <div v-if="state.selectedDate && selectedDateAppointments.length > 0" class="mt-3">
              <h5>{{ formatAppointmentDate(state.selectedDate) }}</h5>
              <div 
                v-for="appointment in selectedDateAppointments" 
                :key="appointment.id"
                class="selected-appointment-item"
              >
                <div class="appointment-time">{{ formatAppointmentTime(appointment.time) }}</div>
                <div class="appointment-doctor">Dr. {{ appointment.doctor }}</div>
              </div>
            </div>
          </template>
        </Card>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <Button 
            :label="t('appointment.add')" 
            severity="primary" 
            @click="onAddAppointment"
            class="action-button"
          />
          <Button 
            :label="t('appointment.edit')" 
            severity="success" 
            @click="onEditAppointment(upcomingAppointments[0])"
            :disabled="upcomingAppointments.length === 0"
            class="action-button"
          />
        </div>
      </div>
    </div>

    <!-- Add Appointment Dialog -->
    <Dialog 
      v-model:visible="state.showAddDialog" 
      :header="t('appointment.addNew')" 
      modal
      :style="{ width: '500px' }"
    >
      <div class="p-4">
        <div class="field mb-3">
          <label for="newDate" class="block mb-2 font-semibold">{{ t('appointment.fields.date') }} *</label>
          <InputText 
            id="newDate" 
            v-model="state.newAppointment.date"
            type="date" 
            class="w-full" 
          />
        </div>
        
        <div class="field mb-3">
          <label for="newTime" class="block mb-2 font-semibold">{{ t('appointment.fields.time') }} *</label>
          <Dropdown
            id="newTime"
            v-model="state.newAppointment.time"
            :options="availableTimeSlots"
            optionLabel="label"
            optionValue="value"
            :placeholder="t('appointment.placeholders.time')"
            class="w-full"
          />
        </div>
        
        <div class="field mb-3">
          <label for="newDoctor" class="block mb-2 font-semibold">{{ t('appointment.fields.doctor') }} *</label>
          <Dropdown
            id="newDoctor"
            v-model="state.newAppointment.doctor"
            :options="availableDoctors"
            optionLabel="label"
            optionValue="value"
            :placeholder="t('appointment.placeholders.doctor')"
            class="w-full"
          />
        </div>
        
        <div class="field mb-3">
          <label for="newNotes" class="block mb-2 font-semibold">{{ t('appointment.fields.notes') }}</label>
          <Textarea 
            id="newNotes" 
            v-model="state.newAppointment.notes"
            :placeholder="t('appointment.placeholders.notes')" 
            class="w-full" 
            :rows="3" 
          />
        </div>
        
        <div class="flex justify-content-end gap-2 mt-4">
          <Button :label="t('appointment.cancel')" severity="secondary" @click="cancelDialog" />
          <Button :label="t('appointment.save')" severity="primary" @click="saveAppointment" />
        </div>
      </div>
    </Dialog>

    <!-- Edit Appointment Dialog -->
    <Dialog 
      v-model:visible="state.showEditDialog" 
      :header="t('appointment.editAppointment')" 
      modal
      :style="{ width: '500px' }"
    >
      <div class="p-4">
        <div class="field mb-3">
          <label for="editDate" class="block mb-2 font-semibold">{{ t('appointment.fields.date') }} *</label>
          <InputText 
            id="editDate" 
            v-model="state.newAppointment.date"
            type="date" 
            class="w-full" 
          />
        </div>
        
        <div class="field mb-3">
          <label for="editTime" class="block mb-2 font-semibold">{{ t('appointment.fields.time') }} *</label>
          <Dropdown
            id="editTime"
            v-model="state.newAppointment.time"
            :options="availableTimeSlots"
            optionLabel="label"
            optionValue="value"
            :placeholder="t('appointment.placeholders.time')"
            class="w-full"
          />
        </div>
        
        <div class="field mb-3">
          <label for="editDoctor" class="block mb-2 font-semibold">{{ t('appointment.fields.doctor') }} *</label>
          <Dropdown
            id="editDoctor"
            v-model="state.newAppointment.doctor"
            :options="availableDoctors"
            optionLabel="label"
            optionValue="value"
            :placeholder="t('appointment.placeholders.doctor')"
            class="w-full"
          />
        </div>
        
        <div class="field mb-3">
          <label for="editNotes" class="block mb-2 font-semibold">{{ t('appointment.fields.notes') }}</label>
          <Textarea 
            id="editNotes" 
            v-model="state.newAppointment.notes"
            :placeholder="t('appointment.placeholders.notes')" 
            class="w-full" 
            :rows="3" 
          />
        </div>
        
        <div class="flex justify-content-end gap-2 mt-4">
          <Button 
            :label="t('appointment.delete')" 
            severity="danger" 
            @click="deleteAppointment(state.selectedAppointment!); state.showEditDialog = false" 
            class="mr-auto"
          />
          <Button :label="t('appointment.cancel')" severity="secondary" @click="cancelDialog" />
          <Button :label="t('appointment.save')" severity="primary" @click="saveAppointment" />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<!-- Global styles to ensure Sunday styling works -->
<style>
/* Sunday columns styling - using global styles to override any scoped conflicts */
.calendar-day:nth-child(7n+1) {
  color: #e74c3c !important;
}

.calendar-day:nth-child(7n+1) .calendar-day-number {
  color: #e74c3c !important;
}

.calendar-day.calendar-day-sunday {
  color: #e74c3c !important;
}

.calendar-day.calendar-day-sunday .calendar-day-number {
  color: #e74c3c !important;
}

/* Ensure Sunday styling overrides all states */
.calendar-day:nth-child(7n+1).current-month,
.calendar-day:nth-child(7n+1).other-month,
.calendar-day:nth-child(7n+1).selected,
.calendar-day:nth-child(7n+1).today {
  color: #e74c3c !important;
}

.calendar-day:nth-child(7n+1).current-month .calendar-day-number,
.calendar-day:nth-child(7n+1).other-month .calendar-day-number,
.calendar-day:nth-child(7n+1).selected .calendar-day-number,
.calendar-day:nth-child(7n+1).today .calendar-day-number {
  color: #e74c3c !important;
}
</style>

<style scoped>
.appointments-page {
  padding: 1rem 2rem;
  background-color: #f5f6fa;
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
}

.appointments-layout {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 2rem;
  width: 100%;
  height: 100%;
}

@media (max-width: 1200px) {
  .appointments-layout {
    grid-template-columns: 1fr 350px;
    gap: 1.5rem;
  }
}

@media (max-width: 1024px) {
  .appointments-layout {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .appointments-page {
    padding: 1rem;
  }
}

.calendar-section {
  min-width: 0; /* Prevents grid overflow */
}

.appointments-section {
  min-width: 0; /* Prevents grid overflow */
}

/* Calendar Styles */
.calendar-card {
  height: fit-content;
}

.calendar-container {
  max-width: 100%;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  height: 40px;
  min-height: 40px;
}

.calendar-header :deep(.p-button) {
  cursor: pointer;
  width: 40px;
  height: 40px;
  min-width: 40px;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.calendar-title {
  margin: 0;
  color: #1f2937;
  font-weight: 600;
  font-size: 1.25rem;
  flex: 1;
  text-align: center;
  line-height: 40px;
  min-width: 200px;
}

.calendar-grid {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  background-color: #ffffff;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background-color: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.calendar-weekday {
  padding: 1rem 0.75rem;
  text-align: center;
  font-weight: 600;
  color: #4b5563;
  font-size: 0.875rem;
}

.calendar-weekday-sunday {
  color: #dc2626 !important;
  font-weight: 700;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.calendar-day {
  height: 90px;
  padding: 0.75rem;
  border-right: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: #ffffff;
}

.calendar-day:nth-child(7n) {
  border-right: none;
}

.calendar-day:hover {
  background-color: #f3f4f6;
}

.calendar-day-current {
  color: #1f2937;
  background-color: #ffffff;
  font-weight: 500;
}

.calendar-day-other {
  background-color: #f1f5f9;
  color: #cbd5e1;
  font-weight: 400;
}

.calendar-day-other:hover {
  background-color: #e2e8f0;
}

.calendar-day-today {
  background-color: #dbeafe !important;
  border: 2px solid #3b82f6;
  font-weight: 600;
}

.calendar-day-selected {
  background-color: #3b82f6 !important;
  color: #ffffff !important;
  font-weight: 600;
}

.calendar-day-selected .calendar-day-number {
  color: #ffffff;
}

.calendar-day-selected.calendar-day-sunday {
  background-color: #dc2626 !important;
  color: #ffffff !important;
}

.calendar-day-selected.calendar-day-sunday .calendar-day-number {
  color: #ffffff !important;
}

.calendar-day-has-appointment {
  background-color: #f0f9ff;
}

.calendar-day-has-appointment.calendar-day-selected {
  background-color: #3b82f6 !important;
}

.calendar-day-number {
  font-weight: 500;
  font-size: 0.875rem;
}

.calendar-appointment-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: auto;
  gap: 4px;
  flex-wrap: wrap;
  min-height: 12px;
}

.appointment-dot {
  width: 6px;
  height: 6px;
  background-color: #3b82f6;
  border-radius: 50%;
  flex-shrink: 0;
}

.appointment-more {
  font-size: 10px;
  color: #3b82f6;
  font-weight: bold;
  margin-left: 1px;
}

.calendar-day-selected .appointment-dot {
  background-color: #ffffff;
}

.calendar-day-selected .appointment-more {
  color: #ffffff;
}

/* Appointment List Styles */
.appointments-card {
  height: fit-content;
}

.appointment-item {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.appointment-item:hover {
  border-color: #3b82f6;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
}

.appointment-date-time {
  color: #1f2937;
  font-size: 0.9rem;
  font-weight: 500;
}

.selected-appointment-item {
  background-color: #ffffff;
  border-radius: 6px;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
}

/* Divider line between general appointments and selected date appointments */
.appointment-divider {
  width: 100%;
  height: 1px;
  background-color: #e2e8f0;
  margin: 1rem 0;
  border: none;
}

.appointment-time {
  font-weight: 600;
  color: #1f2937;
}

.appointment-doctor {
  color: #6b7280;
  font-size: 0.875rem;
}

/* Action Buttons */
.action-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-top: 1rem;
}

.action-button {
  width: 100%;
  color: #ffffff !important;
  transition: background-color 0.3s ease !important;
  min-width: 0 !important;
  max-width: none !important;
  min-height: 0 !important;
  max-height: none !important;
  box-sizing: border-box !important;
}

/* Force exact dimensions and prevent any size changes */
:deep(.action-button) {
  width: 100% !important;
  height: 48px !important;
  min-width: 0 !important;
  max-width: none !important;
  min-height: 48px !important;
  max-height: 48px !important;
  box-sizing: border-box !important;
  overflow: hidden !important;
  border-radius: 8px !important;
  transition: background-color 0.3s ease !important;
  transform: none !important;
  animation: none !important;
  will-change: auto !important;
  border: 1px solid transparent !important;
  margin: 0 !important;
  outline: none !important;
  position: relative !important;
}

:deep(.action-button),
:deep(.action-button:hover),
:deep(.action-button:focus),
:deep(.action-button:active) {
  width: 100% !important;
  height: 48px !important;
  min-width: 0 !important;
  max-width: none !important;
  min-height: 48px !important;
  max-height: 48px !important;
  box-sizing: border-box !important;
  overflow: hidden !important;
  border-radius: 8px !important;
  transform: none !important;
  scale: 1 !important;
  padding: 0.75rem 1.5rem !important;
  border: 1px solid transparent !important;
  margin: 0 !important;
  font-size: 1rem !important;
  line-height: 1.2 !important;
  animation: none !important;
  will-change: auto !important;
  outline: none !important;
  position: relative !important;
}

/* Completely disable size-changing transitions and effects, but allow color transitions */
:deep(.action-button) {
  transition: background-color 0.3s ease, border-color 0.3s ease !important;
  animation: none !important;
}

:deep(.action-button *) {
  transition: color 0.3s ease !important;
  animation: none !important;
}

/* Ensure action buttons have white text */
.action-button.p-button-primary,
.action-button.p-button-success {
  color: #ffffff !important;
}

/* More specific selectors for PrimeVue button text */
:deep(.action-button.p-button-primary .p-button-label),
:deep(.action-button.p-button-success .p-button-label) {
  color: #ffffff !important;
}

:deep(.action-button) {
  color: #ffffff !important;
}

:deep(.action-button span) {
  color: #ffffff !important;
}

/* Prevent hover/focus effects on action buttons - except color changes */
:deep(.action-button:hover),
:deep(.action-button:focus),
:deep(.action-button:active) {
  transform: none !important;
  box-shadow: none !important;
  filter: none !important;
  opacity: 1 !important;
  scale: 1 !important;
  width: 100% !important;
  height: 48px !important;
  padding: 0.75rem 1.5rem !important;
  border-width: 1px !important;
  outline: none !important;
  min-width: 0 !important;
  max-width: none !important;
  min-height: 48px !important;
  max-height: 48px !important;
  font-size: inherit !important;
  line-height: normal !important;
}

:deep(.action-button.p-button-primary:hover),
:deep(.action-button.p-button-primary:focus),
:deep(.action-button.p-button-primary:active) {
  background-color: #2563eb !important;
  color: #ffffff !important;
  border-color: #2563eb !important;
}

:deep(.action-button.p-button-success:hover),
:deep(.action-button.p-button-success:focus),
:deep(.action-button.p-button-success:active) {
  background-color: #059669 !important;
  color: #ffffff !important;
  border-color: #059669 !important;
}

:deep(.action-button:hover .p-button-label),
:deep(.action-button:focus .p-button-label),
:deep(.action-button:active .p-button-label) {
  color: #ffffff !important;
}

:deep(.action-button:hover span),
:deep(.action-button:focus span),
:deep(.action-button:active span) {
  color: #ffffff !important;
}

/* Cards */
:deep(.p-card) {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

:deep(.p-card-body) {
  padding: 1.25rem;
}

:deep(.p-card-title) {
  margin-bottom: 1rem;
  color: #1f2937;
  font-weight: 600;
  font-size: 1.125rem;
}

:deep(.p-card-content) {
  padding: 0;
}

/* Button styling */
:deep(.p-button) {
  border-radius: 6px;
  font-weight: 600;
  border: none;
  padding: 0.75rem 1.5rem;
  transition: background-color 0.3s ease, border-color 0.3s ease !important;
  animation: none !important;
  transform: none !important;
  will-change: auto !important;
}

:deep(.p-button:hover),
:deep(.p-button:focus),
:deep(.p-button:active) {
  transform: none !important;
  scale: none !important;
  transition: background-color 0.3s ease, border-color 0.3s ease !important;
  animation: none !important;
  will-change: auto !important;
}

:deep(.p-button-primary) {
  background-color: #3b82f6 !important;
  color: #ffffff !important;
}

:deep(.p-button-success) {
  background-color: #10b981 !important;
  color: #ffffff !important;
}

:deep(.p-button-danger) {
  background-color: #ef4444 !important;
  color: #ffffff !important;
}

:deep(.p-button-secondary) {
  background-color: #6b7280 !important;
  color: #ffffff !important;
}

:deep(.p-button-text) {
  background-color: transparent !important;
  border: none !important;
  color: #6b7280 !important;
  padding: 0.5rem !important;
  transition: none !important;
}

:deep(.p-button-text:hover) {
  background-color: transparent !important;
  color: #6b7280 !important;
  border: none !important;
  padding: 0.5rem !important;
  transform: none !important;
  box-shadow: none !important;
}

:deep(.p-button-text:focus) {
  background-color: transparent !important;
  color: #6b7280 !important;
  box-shadow: none !important;
  border: none !important;
  padding: 0.5rem !important;
  transform: none !important;
}

:deep(.p-button-text:active) {
  background-color: transparent !important;
  color: #6b7280 !important;
  border: none !important;
  padding: 0.5rem !important;
  transform: none !important;
}

:deep(.p-button-small) {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

/* Dialog styling */
:deep(.p-dialog) {
  border-radius: 8px;
}

:deep(.p-dialog-header) {
  background-color: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  color: #1f2937;
}

:deep(.p-dialog-content) {
  background-color: #ffffff;
  color: #1f2937;
}

/* Form styling */
:deep(.p-inputtext) {
  border-radius: 6px;
  background-color: #ffffff;
  border: 1px solid #d1d5db;
  color: #1f2937;
}

:deep(.p-inputtext:focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

:deep(.p-dropdown) {
  border-radius: 6px;
  background-color: #ffffff;
  border: 1px solid #d1d5db;
  color: #1f2937;
}

:deep(.p-dropdown:not(.p-disabled):hover) {
  border-color: #9ca3af;
}

:deep(.p-dropdown:not(.p-disabled).p-focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

:deep(.p-dropdown-panel) {
  background-color: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

:deep(.p-dropdown-items) {
  padding: 0.25rem 0;
}

:deep(.p-dropdown-item) {
  color: #1f2937;
  padding: 0.75rem 1rem;
  transition: all 0.2s ease;
}

:deep(.p-dropdown-item:hover) {
  background-color: #f3f4f6;
}

:deep(.p-dropdown-item.p-highlight) {
  background-color: #3b82f6;
  color: #ffffff;
}

:deep(.p-inputtextarea) {
  border-radius: 6px;
  background-color: #ffffff;
  border: 1px solid #d1d5db;
  color: #1f2937;
}

:deep(.p-inputtextarea:focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.field label {
  color: #374151;
  font-weight: 600;
  font-size: 0.875rem;
}

/* Responsive adjustments */
@media (max-width: 992px) {
  .appointments-page {
    padding: 0.75rem;
  }
  
  :deep(.pr-3) {
    padding-right: 0 !important;
  }
  
  .calendar-card,
  .appointments-card {
    margin-bottom: 1rem;
  }
}

@media (max-width: 768px) {
  .calendar-day {
    height: 50px;
    padding: 0.25rem;
  }
  
  .calendar-weekday {
    padding: 0.5rem 0.25rem;
    font-size: 0.75rem;
  }
  
  .calendar-day-number {
    font-size: 0.75rem;
  }
  
  .action-buttons {
    grid-template-columns: 1fr;
  }
}

/* Ensure text is readable */
.appointments-page,
.appointments-page :where(*) {
  color: #1f2937;
}

/* IMPORTANT: First column (Sundays) styling - must be at the end for priority */
.calendar-day:nth-child(7n+1),
.calendar-day.calendar-day-sunday {
  color: #dc2626 !important;
  font-weight: 700 !important;
}

.calendar-day:nth-child(7n+1) .calendar-day-number,
.calendar-day.calendar-day-sunday .calendar-day-number {
  color: #dc2626 !important;
  font-weight: 700 !important;
}

.calendar-day:nth-child(7n+1).calendar-day-other,
.calendar-day.calendar-day-sunday.calendar-day-other {
  color: #fca5a5 !important;
  font-weight: 600 !important;
}

.calendar-day:nth-child(7n+1).calendar-day-other .calendar-day-number,
.calendar-day.calendar-day-sunday.calendar-day-other .calendar-day-number {
  color: #fca5a5 !important;
  font-weight: 600 !important;
}

.calendar-day:nth-child(7n+1).calendar-day-selected,
.calendar-day.calendar-day-sunday.calendar-day-selected {
  background-color: #dc2626 !important;
  color: #ffffff !important;
}

.calendar-day:nth-child(7n+1).calendar-day-selected .calendar-day-number,
.calendar-day.calendar-day-sunday.calendar-day-selected .calendar-day-number {
  color: #ffffff !important;
}

.calendar-day:nth-child(7n+1).calendar-day-today,
.calendar-day.calendar-day-sunday.calendar-day-today {
  background-color: #dbeafe !important;
  border: 2px solid #dc2626 !important;
  color: #dc2626 !important;
}

.calendar-day:nth-child(7n+1).calendar-day-today .calendar-day-number,
.calendar-day.calendar-day-sunday.calendar-day-today .calendar-day-number {
  color: #dc2626 !important;
}
</style>