// Google Calendar Event Assembler
export class AppointmentAssembler {
  // Transform Google Calendar event to appointment entity
  static toEntity(googleEvent) {
    if (!googleEvent) return null;
    
    return {
      id: googleEvent.id,
      title: googleEvent.summary || 'Cita médica',
      doctorName: this.extractDoctorName(googleEvent.description),
      patientName: this.extractPatientName(googleEvent.description),
      startDate: new Date(googleEvent.start.dateTime || googleEvent.start.date),
      endDate: new Date(googleEvent.end.dateTime || googleEvent.end.date),
      notes: googleEvent.description || '',
      location: googleEvent.location || 'Clínica DiabeLife',
      status: this.mapGoogleStatus(googleEvent.status),
      type: this.extractAppointmentType(googleEvent.description),
      attendees: this.extractAttendees(googleEvent.attendees),
      created: new Date(googleEvent.created),
      updated: new Date(googleEvent.updated)
    };
  }

  // Transform appointment entity to Google Calendar event format
  static toGoogleEvent(appointment) {
    const description = this.buildDescription(appointment);
    
    return {
      summary: appointment.title || `Cita con ${appointment.doctorName}`,
      description,
      start: {
        dateTime: appointment.startDate instanceof Date 
          ? appointment.startDate.toISOString() 
          : new Date(appointment.startDate).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      end: {
        dateTime: appointment.endDate instanceof Date 
          ? appointment.endDate.toISOString() 
          : new Date(appointment.endDate).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      location: appointment.location || 'Clínica DiabeLife',
      attendees: this.buildAttendees(appointment),
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 24 hours before
          { method: 'popup', minutes: 30 }      // 30 minutes before
        ]
      }
    };
  }

  // Transform multiple Google Calendar events to appointment entities
  static toEntityList(googleEvents) {
    if (!Array.isArray(googleEvents)) return [];
    return googleEvents.map(event => this.toEntity(event)).filter(Boolean);
  }

  // Helper methods
  static extractDoctorName(description) {
    if (!description) return 'No especificado';
    const match = description.match(/Doctor:\s*(.+?)(?:\n|$)/);
    return match ? match[1].trim() : 'No especificado';
  }

  static extractPatientName(description) {
    if (!description) return 'No especificado';
    const match = description.match(/Paciente:\s*(.+?)(?:\n|$)/);
    return match ? match[1].trim() : 'No especificado';
  }

  static extractAppointmentType(description) {
    if (!description) return 'consulta';
    const match = description.match(/Tipo:\s*(.+?)(?:\n|$)/);
    return match ? match[1].trim() : 'consulta';
  }

  static extractAttendees(googleAttendees) {
    if (!googleAttendees) return [];
    return googleAttendees.map(attendee => ({
      email: attendee.email,
      displayName: attendee.displayName,
      responseStatus: attendee.responseStatus
    }));
  }

  static mapGoogleStatus(googleStatus) {
    const statusMap = {
      'confirmed': 'confirmada',
      'tentative': 'tentativa',
      'cancelled': 'cancelada'
    };
    return statusMap[googleStatus] || 'confirmada';
  }

  static buildDescription(appointment) {
    const lines = [
      `Doctor: ${appointment.doctorName || 'No especificado'}`,
      `Paciente: ${appointment.patientName || 'No especificado'}`,
      `Tipo: ${appointment.type || 'consulta'}`
    ];
    
    if (appointment.notes && appointment.notes.trim()) {
      lines.push(`Notas: ${appointment.notes.trim()}`);
    }
    
    return lines.join('\n');
  }

  static buildAttendees(appointment) {
    const attendees = [];
    
    if (appointment.patientEmail) {
      attendees.push({
        email: appointment.patientEmail,
        displayName: appointment.patientName
      });
    }
    
    if (appointment.doctorEmail) {
      attendees.push({
        email: appointment.doctorEmail,
        displayName: appointment.doctorName
      });
    }
    
    return attendees;
  }

  // Format appointment for calendar view
  static toCalendarEvent(appointment) {
    return {
      id: appointment.id,
      title: appointment.title || `${appointment.doctorName}`,
      start: appointment.startDate,
      end: appointment.endDate,
      backgroundColor: this.getStatusColor(appointment.status),
      borderColor: this.getStatusColor(appointment.status),
      textColor: '#ffffff',
      extendedProps: {
        doctorName: appointment.doctorName,
        patientName: appointment.patientName,
        type: appointment.type,
        location: appointment.location,
        notes: appointment.notes,
        status: appointment.status
      }
    };
  }

  static getStatusColor(status) {
    const colorMap = {
      'confirmada': '#28a745',
      'tentativa': '#ffc107',
      'cancelada': '#dc3545',
      'completed': '#6c757d'
    };
    return colorMap[status] || '#007bff';
  }

  // Validate appointment data before sending to Google Calendar
  static validateAppointment(appointment) {
    const errors = [];
    
    if (!appointment.title && !appointment.doctorName) {
      errors.push('Se requiere un título o nombre del doctor');
    }
    
    if (!appointment.startDate) {
      errors.push('Se requiere una fecha de inicio');
    }
    
    if (!appointment.endDate) {
      errors.push('Se requiere una fecha de fin');
    }
    
    if (appointment.startDate && appointment.endDate) {
      const start = new Date(appointment.startDate);
      const end = new Date(appointment.endDate);
      
      if (start >= end) {
        errors.push('La fecha de fin debe ser posterior a la fecha de inicio');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Legacy support - keeping backward compatibility
export const toAppointmentResource = (entity) => {
  if (!entity) return null;
  
  return {
    id: entity.id || null,
    title: entity.title || '',
    doctor: entity.doctor || entity.doctorName || '',
    specialty: entity.specialty || 'General',
    date: entity.date || (entity.startDate ? entity.startDate.split('T')[0] : ''),
    time: entity.time || (entity.startDate ? new Date(entity.startDate).toTimeString().slice(0, 5) : ''),
    status: entity.status || 'scheduled',
    notes: entity.notes || '',
    location: entity.location || '',
    createdAt: entity.createdAt || entity.created || new Date(),
    updatedAt: entity.updatedAt || entity.updated || new Date()
  };
};

export const toAppointmentRequest = (appointment) => {
  if (!appointment) return null;
  
  return {
    title: appointment.title,
    doctor: appointment.doctor,
    specialty: appointment.specialty,
    date: appointment.date,
    time: appointment.time,
    status: appointment.status || 'scheduled',
    notes: appointment.notes || '',
    location: appointment.location || 'Clínica DiabeLife'
  };
};

export const toDoctorResource = (doctor) => {
  if (!doctor) return null;
  
  return {
    id: doctor.id,
    name: doctor.name,
    specialty: doctor.specialty,
    available: doctor.available !== false
  };
};

export const formatAppointmentDateTime = (date, time) => {
  if (!date || !time) return '';
  return `${date} ${time}`;
};

export const formatAppointmentDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString();
};

export const formatAppointmentTime = (time) => {
  if (!time) return '';
  return time;
};

// Main export compatibility
export const fromAppointmentResource = (resource) => AppointmentAssembler.toGoogleEvent(resource);