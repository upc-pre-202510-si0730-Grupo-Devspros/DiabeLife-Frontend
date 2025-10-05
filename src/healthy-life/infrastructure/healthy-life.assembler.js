export function toHealthyResource(entity) {
  if (!entity) return { heartRate: 0, glucose: 0, weight: 0, bloodPressure: '0/0' }
  return {
    id: entity.id,
    heartRate: entity.heartRate ?? 0,
    glucose: entity.glucose ?? 0,
    weight: entity.weight ?? 0,
    bloodPressure: entity.bloodPressure ?? '0/0'
  }
}

export function toHealthyRequest(data) {
  return {
    heartRate: data.heartRate,
    glucose: data.glucose,
    weight: data.weight,
    bloodPressure: data.bloodPressure
  }
}

export function toFoodResource(entity) {
  if (!entity) return { id: undefined, food: '', timestamp: undefined }
  return {
    id: entity.id,
    food: entity.food,
    timestamp: entity.timestamp
  }
}
