// src/Reports/infrastructure/JsonServerReportRepository.js
import { ReportRepository } from '@/Reports/domain/repositories/ReportRepository.js';
import { Report } from '@/Reports/domain/entities/Report.js';
import { ApiClient } from '../http/ApiClient.js';

export class JsonServerReportRepository extends ReportRepository {
    constructor() {
        super();
        this.apiClient = new ApiClient();
        this.baseEndpoint = '/Reports';
    }

    async getAll() {
        try {
            const data = await this.apiClient.get(this.baseEndpoint);
            
            // Verificar si la respuesta es un array
            if (!Array.isArray(data)) {
                console.warn('Expected array from backend, received:', typeof data);
                return [];
            }
            
            return data.map(item => new Report({
                id: item.id,
                name: item.name,
                date: item.date,
                type: item.type,
                data: item.data,
                selected: item.selected || false,
                shared: item.shared || false,
                userId: item.userId,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt
            }));
        } catch (error) {
            console.error('Error loading reports:', error);
            // Si es error 404, probablemente no hay reportes aún
            if (error.response?.status === 404) {
                return [];
            }
            throw error;
        }
    }

    async getById(id) {
        try {
            const data = await this.apiClient.get(`${this.baseEndpoint}/${id}`);
            return new Report({
                id: data.id,
                name: data.name,
                date: data.date,
                type: data.type,
                data: data.data,
                selected: data.selected || false,
                shared: data.shared || false,
                userId: data.userId,
                createdAt: data.createdAt,
                updatedAt: data.updatedAt
            });
        } catch (error) {
            console.error(`Error loading report ${id}:`, error);
            throw error;
        }
    }

    async create(report) {
        try {
            // Mapear al DTO esperado por el backend (CreateReportDto)
            const createReportDto = {
                name: report.name,
                date: report.date || new Date().toISOString(),
                type: report.type,
                data: report.data,
                selected: report.selected || false,
                shared: report.shared || false
            };
            
            const response = await this.apiClient.post(this.baseEndpoint, createReportDto);
            
            // El backend retorna 201 Created con mensaje
            if (response.message) {
                console.log('Report created successfully:', response.message);
                // Retornamos el objeto que enviamos con un ID temporal
                // En una implementación real, el backend debería retornar el objeto creado
                return { ...createReportDto, id: Date.now() };
            }
            
            return response;
        } catch (error) {
            console.error('Error creating report:', error);
            throw error;
        }
    }

    async update(id, report) {
        try {
            // Mapear al DTO esperado por el backend (UpdateReportDto)
            const updateReportDto = {
                name: report.name,
                date: report.date,
                type: report.type,
                data: report.data,
                selected: report.selected,
                shared: report.shared
            };
            
            const response = await this.apiClient.put(`${this.baseEndpoint}/${id}`, updateReportDto);
            return response;
        } catch (error) {
            console.error(`Error updating report ${id}:`, error);
            throw error;
        }
    }

    async delete(id) {
        try {
            await this.apiClient.delete(`${this.baseEndpoint}/${id}`);
        } catch (error) {
            console.error(`Error deleting report ${id}:`, error);
            throw error;
        }
    }

    async shareReports(reportIds, shared = true) {
        try {
            // Usar el DTO exacto esperado por el backend (ShareReportsDto)
            const shareReportsDto = {
                reportIds: reportIds,
                shared: shared
            };

            const response = await this.apiClient.post(`${this.baseEndpoint}/shared`, shareReportsDto);
            return response;
        } catch (error) {
            console.error('Error sharing reports:', error);
            throw error;
        }
    }
}
