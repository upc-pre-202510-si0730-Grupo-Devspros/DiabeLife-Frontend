export function HealthyEntity({ id, heartRate, glucose, weight, bloodPressure } = {}) {
  return {
    id,
    heartRate: heartRate ?? null,
    glucose: glucose ?? null,
    weight: weight ?? null,
    bloodPressure: bloodPressure ?? ''
  }
}
