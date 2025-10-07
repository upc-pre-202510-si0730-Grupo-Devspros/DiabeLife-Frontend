export function AppointmentEntity({ 
  id, 
  date, 
  time, 
  doctor, 
  specialty, 
  status, 
  notes, 
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