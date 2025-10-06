import { ReportRepository } from '../../domain/repositories/ReportRepository.js';
import { Report } from '../../domain/entities/Report.js';
import { ApiClient } from '../http/ApiClient.js';

export class JsonServerReportRepository extends ReportRepository {
    constructor() {
        super();
        this.apiClient = new ApiClient('http://localhost:3000');
    }

    async getAll() {
        const data = await this.apiClient.get('/reports');
        return data.map(item => new Report(item));
    }

    async getById(id) {
        const data = await this.apiClient.get(`/reports/${id}`);
        return new Report(data);
    }

    async create(report) {
        const data = await this.apiClient.post('/reports', report);
        return new Report(data);
    }

    async update(id, report) {
        const data = await this.apiClient.put(`/reports/${id}`, report);
        return new Report(data);
    }

    async delete(id) {
        await this.apiClient.delete(`/reports/${id}`);
    }

    async shareReports(reportIds, message) {
        const reports = await this.getAll();
        const selectedReports = reports.filter(r => reportIds.includes(r.id));

        const sharedData = {
            id: Date.now(),
            reports: selectedReports.map(r => ({
                ...r,
                shared: true,
                sharedAt: new Date().toISOString()
            })),
            message,
            sharedAt: new Date().toISOString()
        };

        await this.apiClient.post('/sharedReports', sharedData);

        for (const reportId of reportIds) {
            const report = await this.getById(reportId);
            await this.update(reportId, {
                ...report,
                shared: true,
                selected: false
            });
        }

        return sharedData;
    }
}
