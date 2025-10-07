export class GlucoseMeasurement {
    constructor(id, value, unit, status, trend, date) {
        this.id = id;
        this.value = value;
        this.unit = unit;
        this.status = status;
        this.trend = trend;
        this.date = date;
    }
}