export function toHealthyResource(entity) {
  if (!entity) return { heartRate: 0, glucose: 0, weight: 0, bloodPressure: '0/0' }
  return {
    id: entity.id,
    heartRate: entity.heartRate ?? entity.HeartRate ?? 0,
    glucose: entity.glucose ?? entity.Glucose ?? 0,
    weight: entity.weight ?? entity.Weight ?? 0,
    bloodPressure: entity.bloodPressure ?? entity.BloodPressure ?? '0/0'
  }
}

export function toHealthyRequest(data) {
  return {
    heartRate: Number(data.heartRate) || 0,
    glucose: Number(data.glucose) || 0,
    weight: Number(data.weight) || 0,
    bloodPressure: data.bloodPressure || '0/0',
    timestamp: new Date().toISOString()
  }
}

export function toFoodResource(entity) {
  if (!entity) return { id: undefined, name: '', timestamp: undefined }
  return {
    id: entity.id,
    name: entity.name || entity.food || '',
    food: entity.name || entity.food || '', // Mantener compatibilidad
    timestamp: entity.timestamp,
    calories: entity.calories || 0
  }
}

export function toFoodRequest(data) {
  return {
    name: data.name || data.food,
    calories: Number(data.calories) || 0,
    timestamp: data.timestamp || new Date().toISOString()
  }
}
