<script setup lang="ts">
import { defineProps, defineEmits, reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'

const { t } = useI18n()

type AppointmentsByDate = Record<string, Array<{
  id?: number
  date: string
  time: string
  doctor: string
  specialty: string
  status: string
}>>

const props = defineProps<{
  appointments: AppointmentsByDate
  selectedDate?: string | null
}>()

const emit = defineEmits<{
  'date-select': [date: string]
}>()

const state = reactive({
  currentDate: new Date(),
  currentMonth: new Date().getMonth(),
  currentYear: new Date().getFullYear()
})

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

  for (let i = 0; i < firstDayOfWeek; i++) {
    const prevDate = new Date(state.currentYear, state.currentMonth, -(firstDayOfWeek - 1 - i))
    days.push({
      day: prevDate.getDate(),
      date: formatDate(prevDate),
      isCurrentMonth: false,
      hasAppointment: false,
      appointmentCount: 0
    })
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(state.currentYear, state.currentMonth, day)
    const dateStr = formatDate(date)
    const appointments = props.appointments[dateStr] || []

    days.push({
      day,
      date: dateStr,
      isCurrentMonth: true,
      hasAppointment: appointments.length > 0,
      appointmentCount: appointments.length,
      isSelected: props.selectedDate === dateStr,
      isToday: isToday(date)
    })
  }

  const remainingDays = 42 - days.length
  for (let i = 1; i <= remainingDays; i++) {
    const nextDate = new Date(state.currentYear, state.currentMonth + 1, i)
    days.push({
      day: nextDate.getDate(),
      date: formatDate(nextDate),
      isCurrentMonth: false,
      hasAppointment: false,
      appointmentCount: 0
    })
  }

  return days
})

const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0]
}

const isToday = (date: Date): boolean => {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

const onDateClick = (day: any) => {
  if (day.isCurrentMonth) {
    emit('date-select', day.date)
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
  emit('date-select', formatDate(today))
}
</script>

<template>
  <div class="calendar-view">
    <!-- Header -->
    <div class="calendar-header flex justify-content-between align-items-center mb-3">
      <Button icon="pi pi-chevron-left" severity="secondary" text @click="previousMonth" />
      <h3 class="calendar-title">{{ currentMonthName }}</h3>
      <Button icon="pi pi-chevron-right" severity="secondary" text @click="nextMonth" />
    </div>

    <!-- Today Button -->
    <div class="text-center mb-3">
      <Button
          :label="t('calendar.today')"
          severity="info"
          size="small"
          @click="goToToday"
      />
    </div>

    <!-- Calendar Grid -->
    <div class="calendar-grid">
      <div class="calendar-weekdays">
        <div v-for="day in weekDays" :key="day" class="calendar-weekday">
          {{ day }}
        </div>
      </div>

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
            'calendar-day-has-appointment': day.hasAppointment
          }"
            @click="onDateClick(day)"
        >
          <div class="calendar-day-number">{{ day.day }}</div>
          <div v-if="day.hasAppointment && day.isCurrentMonth" class="calendar-appointment-indicator">
            <div class="appointment-dot"></div>
            <div v-if="day.appointmentCount > 1" class="appointment-count">
              {{ day.appointmentCount }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<style scoped>
.calendar-view {
  max-width: 100%;
}

.calendar-title {
  margin: 0;
  color: #1f2937;
  font-weight: 600;
  font-size: 1.25rem;
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
  padding: 0.75rem;
  text-align: center;
  font-weight: 600;
  color: #6b7280;
  font-size: 0.875rem;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.calendar-day {
  min-height: 80px;
  padding: 0.5rem;
  border-right: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.calendar-day:nth-child(7n) {
  border-right: none;
}

.calendar-day:hover {
  background-color: #f3f4f6;
}

.calendar-day-current {
  background-color: #ffffff;
  color: #1f2937;
}

.calendar-day-other {
  background-color: #f8fafc;
  color: #9ca3af;
  cursor: default;
}

.calendar-day-other:hover {
  background-color: #f8fafc;
}

.calendar-day-today {
  background-color: #dbeafe !important;
  border: 2px solid #3b82f6;
}

.calendar-day-selected {
  background-color: #3b82f6 !important;
  color: #ffffff;
}

.calendar-day-selected .calendar-day-number {
  color: #ffffff;
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
  gap: 2px;
  margin-top: auto;
}

.appointment-dot {
  width: 8px;
  height: 8px;
  background-color: #3b82f6;
  border-radius: 50%;
}

.calendar-day-selected .appointment-dot {
  background-color: #ffffff;
}

.appointment-count {
  font-size: 0.75rem;
  font-weight: 600;
  color: #3b82f6;
  background-color: #ffffff;
  border-radius: 10px;
  padding: 2px 6px;
  min-width: 16px;
  text-align: center;
}

.calendar-day-selected .appointment-count {
  color: #3b82f6;
  background-color: #ffffff;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .calendar-day {
    min-height: 60px;
    padding: 0.25rem;
  }
  
  .calendar-weekday {
    padding: 0.5rem;
    font-size: 0.75rem;
  }
  
  .calendar-day-number {
    font-size: 0.75rem;
  }
}
</style>