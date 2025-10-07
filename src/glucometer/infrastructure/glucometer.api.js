import axios from 'axios';

const BASE = 'http://localhost:3000';

export default {
  getLatestMeasurement() {
    
    return Promise.resolve({
      data: {
        id: 1,
        value: 145,
        unit: 'mg/dL',
        status: 'High',
        trend: '1 Rising',
        date: '2025-06-02T09:45:00'
      }
    });
  },

  getWeeklyMeasurements() {
    
    return Promise.resolve({
      data: [
        { day: 'Mon', value: 110 },
        { day: 'Tue', value: 125 },
        { day: 'Wed', value: 115 },
        { day: 'Thu', value: 130 },
        { day: 'Fri', value: 140 },
        { day: 'Sat', value: 135 },
        { day: 'Sun', value: 145 },
      ]
    });
  },

  createMeasurement(payload) {
    return axios.post(`${BASE}/glucose-measurements`, payload);
  }
};