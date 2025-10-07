import glucometerApi from '@/glucometer/infrastructure/glucometer.api.js'; 
import { GlucoseMeasurement } from '@/glucometer/domain/model/glucose-measurement.entity.js';

export class GlucometerService {
    constructor() {
        this.api = glucometerApi; 
    }

    async getLatestMeasurement() {
        const response = await this.api.getLatestMeasurement();
        const data = response.data;
        return new GlucoseMeasurement(data.id, data.value, data.unit, data.status, data.trend, new Date(data.date));
    }

    async getWeeklyMeasurements() {
        const response = await this.api.getWeeklyMeasurements();
        return response.data;
    }
}