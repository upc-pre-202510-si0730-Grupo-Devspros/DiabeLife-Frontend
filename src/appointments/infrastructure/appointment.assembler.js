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
  console.log('toAppointmentResource - Input entity:', entity)
  
  if (!entity) {
    console.warn('toAppointmentResource - Entity is null or undefined, returning default')
    return { 
      id: null, 
      date: '', 
      time: '', 
      doctor: '', 
      specialty: '', 
      status: 'scheduled', 
      notes: '',
      patient: '',
      location: '',
      appointmentType: '',
      createdAt: null,
      updatedAt: null
    }
  }
  
  // Extract date and time from appointmentDate if it exists
  let date = entity.date ?? ''
  let time = entity.time ?? ''
  
  if (entity.appointmentDate && !date && !time) {
    try {
      const appointmentDateTime = new Date(entity.appointmentDate)
      if (appointmentDateTime.getFullYear() > 1900) { // Valid date check
        date = appointmentDateTime.toISOString().split('T')[0] // YYYY-MM-DD format
        time = appointmentDateTime.toTimeString().split(' ')[0].substring(0, 5) // HH:MM format
      }
    } catch (error) {
      console.warn('Could not parse appointmentDate:', entity.appointmentDate, error)
    }
  }
  
  // If we still don't have valid date/time, try to use the sent data
  if (!date || !time) {
    // The backend sometimes returns "0001-01-01T00:00:00" for invalid dates
    // In this case, we should try to reconstruct from the original request data
    if (entity.appointmentDate === "0001-01-01T00:00:00") {
      console.warn('Backend returned invalid date, appointment may not display correctly in calendar')
    }
  }
  
  const result = {
    id: entity.id,
    date: date,
    time: time,
    doctor: entity.doctor ?? '',
    specialty: entity.specialty ?? '',
    status: (entity.status ?? 'scheduled').toLowerCase(), // Backend returns "Scheduled", we want "scheduled"
    notes: entity.notes ?? '',
    patient: entity.patient ?? '',
    location: entity.location ?? '',
    appointmentType: entity.appointmentType ?? '',
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt
  }
  
  console.log('toAppointmentResource - Output result:', result)
  return result
}

export function toAppointmentRequest(data) {
  // Include all required fields based on backend validation
  const request = {
    date: data.date,
    time: data.time,
    doctor: data.doctor,
    specialty: data.specialty || 'General',
    // Required fields from backend validation error
    notes: data.notes || 'No additional notes', // Notes is required
    patient: data.patient || 'Default Patient', // Patient is required
    location: data.location || 'Main Clinic', // Location is required
    appointmentType: data.appointmentType || 'Consultation', // AppointmentType is required
    
    // Also send as appointmentDate in ISO format for backend compatibility
    appointmentDate: `${data.date}T${data.time}:00.000Z`
  }
  
  console.log('Assembler - toAppointmentRequest (with required fields and appointmentDate):', request)
  return request
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