/**
 * Converts an appointment entity from the database into a standardized resource object.
 * @function toAppointmentResource
 * @param {Object} entity - The appointment entity from the database.
 * @returns {Object} The formatted appointment resource.
 * @property {number|null} id - The unique identifier of the appointment.
 * @property {string} date - The appointment date (YYYY-MM-DD).
 * @property {string} time - The appointment time (HH:mm).
 * @property {string} doctor - The name or ID of the assigned doctor.
 * @property {string} specialty - The related medical specialty.
 * @property {string} status - The current appointment status ('scheduled', 'completed', 'cancelled').
 * @property {string} notes - Additional notes about the appointment.
 * @property {Date|null} createdAt - The creation timestamp.
 * @property {Date|null} updatedAt - The last update timestamp.
 *
 * @example
 * const resource = toAppointmentResource({
 *   id: 1,
 *   date: '2025-10-08',
 *   time: '15:00',
 *   doctor: 'Dr. Ruiz',
 *   specialty: 'Dermatology',
 *   status: 'scheduled'
 * });
 * console.log(resource.date); // '2025-10-08'
 */

export function toAppointmentResource(entity) {
  if (!entity) return { 
    id: null, 
    date: '', 
    time: '', 
    doctor: '', 
    specialty: '', 
    status: 'scheduled', 
    notes: '',
    createdAt: null,
    updatedAt: null
  }
  
  return {
    id: entity.id,
    date: entity.date ?? '',
    time: entity.time ?? '',
    doctor: entity.doctor ?? '',
    specialty: entity.specialty ?? '',
    status: entity.status ?? 'scheduled',
    notes: entity.notes ?? '',
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt
  }
}

export function toAppointmentRequest(data) {
  return {
    date: data.date,
    time: data.time,
    doctor: data.doctor,
    specialty: data.specialty,
    status: data.status || 'scheduled',
    notes: data.notes || '',
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

export function toDoctorResource(entity) {
  if (!entity) return { 
    id: null, 
    name: '', 
    specialty: '', 
    available: true 
  }
  
  return {
    id: entity.id,
    name: entity.name ?? '',
    specialty: entity.specialty ?? '',
    available: entity.available ?? true
  }
}

export function formatAppointmentDateTime(date, time) {
  if (!date || !time) return ''
  try {
    const dateObj = new Date(`${date}T${time}`)
    return dateObj.toLocaleString('en-US', {
      month: 'long',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  } catch {
    return `${date} - ${time}`
  }
}

export function formatAppointmentDate(date) {
  if (!date) return ''
  try {
    const dateObj = new Date(date)
    return dateObj.toLocaleDateString('en-US', {
      month: 'long',
      day: '2-digit'
    })
  } catch {
    return date
  }
}

export function formatAppointmentTime(time) {
  if (!time) return ''
  try {
    const [hours, minutes] = time.split(':')
    const date = new Date()
    date.setHours(parseInt(hours), parseInt(minutes))
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  } catch {
    return time
  }
}