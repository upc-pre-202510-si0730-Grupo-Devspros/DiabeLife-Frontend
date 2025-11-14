// src/Reports/infrastructure/JsonServerReportRepository.js
import { ReportRepository } from '@/Reports/domain/repositories/ReportRepository.js';
import { Report } from '@/Reports/domain/entities/Report.js';
import { ApiClient } from '../http/ApiClient.js';

export class JsonServerReportRepository extends ReportRepository {
    constructor() {
        super();
        // Conectado al backend real de Reports usando la configuración existente
        this.apiClient = new ApiClient();
    }

    async getAll() {
        try {
            const response = await this.apiClient.get('/Reports');
            const data = response.data || response;
            
            if (!Array.isArray(data)) {
                return [];
            }
            
            return data.map(item => new Report(item));
        } catch (error) {
            // Si es error 404, probablemente no hay reportes aún
            if (error.response?.status === 404) {
                return [];
            }
            
            throw error;
        }
    }

    async getById(id) {
        const data = await this.apiClient.get(`/Reports/${id}`);
        return new Report(data);
    }

    async create(report) {
        try {
            const response = await this.apiClient.post('/Reports', report);
            return response.data || response;
        } catch (error) {
            throw error;
        }
    }

    async update(id, report) {
        const response = await this.apiClient.put(`/Reports/${id}`, report);
        return response;
    }

    async delete(id) {
        await this.apiClient.delete(`/Reports/${id}`);
    }

    async shareReports(reportIds, shared = true) {
        const shareData = {
            reportIds: reportIds,
            shared: shared
        };

        const response = await this.apiClient.post('/Reports/shared', shareData);
        return response;
    }
}
