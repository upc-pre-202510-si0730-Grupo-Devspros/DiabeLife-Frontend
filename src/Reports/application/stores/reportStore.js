import { defineStore } from 'pinia';
import { ReportService } from '@/Reports/application/services/ReportService.js';
import { JsonServerReportRepository } from '@/Reports/infraestructure/repositories/JsonServerReportRepository.js';

const reportRepository = new JsonServerReportRepository();
const reportService = new ReportService(reportRepository);

export const useReportStore = defineStore('report', {
    state: () => ({
        reports: [],
        loading: false,
        error: null,
        selectedFormat: 'PDF'
    }),

    getters: {
        selectedReports: (state) => state.reports.filter(r => r.selected),
        selectedReportIds: (state) => state.reports.filter(r => r.selected).map(r => r.id)
    },

    actions: {
        async fetchReports() {
            this.loading = true;
            this.error = null;
            try {
                this.reports = await reportService.getAllReports();
                console.log('Reports loaded successfully:', this.reports.length);
            } catch (error) {
                console.error('Error fetching reports:', error);
                
                // Manejo específico de errores del backend C#
                if (error.response?.status === 401) {
                    this.error = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
                } else if (error.response?.status === 404) {
                    console.info('No reports found, showing empty list');
                    this.reports = []; // Mostrar lista vacía en lugar de error
                    this.error = null;
                } else if (error.response?.status === 400) {
                    this.error = error.response.data?.message || 'Error en la solicitud';
                } else {
                    this.error = 'Error al cargar los reportes. Inténtalo de nuevo.';
                }
            } finally {
                this.loading = false;
            }
        },

        async generateFullHealthReport() {
            this.loading = true;
            this.error = null;
            try {
                console.log('Generating full health report with format:', this.selectedFormat);
                await reportService.generateFullHealthReport(this.selectedFormat);
                await this.fetchReports(); // Recargar la lista después de crear
            } catch (error) {
                console.error('Error generating full health report:', error);
                if (error.response?.status === 400) {
                    this.error = error.response.data?.message || 'Error al generar el reporte';
                } else {
                    this.error = 'Error al generar el reporte de salud completo';
                }
            } finally {
                this.loading = false;
            }
        },

        async generateSpecificReport(dataTypes) {
            this.loading = true;
            this.error = null;
            try {
                console.log('Generating specific report for:', dataTypes, 'Format:', this.selectedFormat);
                await reportService.generateSpecificReport(dataTypes, this.selectedFormat);
                await this.fetchReports(); // Recargar la lista después de crear
            } catch (error) {
                console.error('Error generating specific report:', error);
                if (error.response?.status === 400) {
                    this.error = error.response.data?.message || 'Error al generar el reporte específico';
                } else {
                    this.error = 'Error al generar el reporte específico';
                }
            } finally {
                this.loading = false;
            }
        },

        async toggleReportSelection(reportId) {
            try {
                await reportService.toggleReportSelection(reportId);
                await this.fetchReports();
            } catch (error) {
                this.error = error.message;
                console.error('Error toggling selection:', error);
            }
        },

        async shareReports(message = '') {
            this.loading = true;
            this.error = null;
            try {
                console.log('Sharing reports:', this.selectedReportIds);
                await reportService.shareSelectedReports(this.selectedReportIds, true);
                await this.fetchReports(); // Recargar para reflejar el estado compartido
                console.log('Reports shared successfully');
            } catch (error) {
                console.error('Error sharing reports:', error);
                if (error.response?.status === 400) {
                    this.error = error.response.data?.message || 'Error al compartir los reportes';
                } else {
                    this.error = 'Error al compartir los reportes seleccionados';
                }
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async deleteReport(reportId) {
            try {
                console.log('Deleting report:', reportId);
                await reportService.deleteReport(reportId);
                await this.fetchReports(); // Recargar la lista después de eliminar
                console.log('Report deleted successfully');
            } catch (error) {
                console.error('Error deleting report:', error);
                if (error.response?.status === 404) {
                    this.error = 'Reporte no encontrado o sin permisos para eliminarlo';
                } else if (error.response?.status === 400) {
                    this.error = error.response.data?.message || 'Error al eliminar el reporte';
                } else {
                    this.error = 'Error al eliminar el reporte';
                }
            }
        },

        setSelectedFormat(format) {
            this.selectedFormat = format;
        }
    }
});
