/**
 * Appointment Entity
 * Represents an appointment in the healthcare domain.
 * @class
 * @property {Number|null} id - The unique identifier of the appointment.
 * @property {string} date - The date of the appointment (YYYY-MM-DD).
 * @property {string} time - The time of the appointment (HH:mm format).
 * @property {string} doctor - The name or ID of the doctor assigned.
 * @property {string} specialty - The medical specialty related to the appointment.
 * @property {string} status - The current status of the appointment. Possible values: 'scheduled', 'completed', 'cancelled'.
 * @property {string} notes - Additional notes or comments about the appointment.
 * @property {string} patient - The patient name or ID (required by backend).
 * @property {string} location - The location of the appointment (required by backend).
 * @property {string} appointmentType - The type of appointment (required by backend).
 * @property {Date|null} createdAt - The timestamp when the appointment was created.
 * @property {Date|null} updatedAt - The timestamp when the appointment was last updated.
 */


export function AppointmentEntity({
  id, 
  date, 
  time, 
  doctor, 
  specialty, 
  status, 
  notes,
  patient,
  location,
  appointmentType,
  createdAt,
  updatedAt 
} = {}) {
  return {
    id: id ?? null,
    date: date ?? '',
    time: time ?? '',
    doctor: doctor ?? '',
    specialty: specialty ?? '',
    status: status ?? 'scheduled', // scheduled, completed, cancelled
    notes: notes ?? '',
    patient: patient ?? '',
    location: location ?? '',
    appointmentType: appointmentType ?? '',
    createdAt: createdAt ?? null,
    updatedAt: updatedAt ?? null
  }
}

export function DoctorEntity({ id, name, specialty, available } = {}) {
  return {
    id: id ?? null,
    name: name ?? '',
    specialty: specialty ?? '',
    available: available ?? true
  }
}