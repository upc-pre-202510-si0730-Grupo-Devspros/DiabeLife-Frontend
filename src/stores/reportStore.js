import { defineStore } from 'pinia';
import { ReportService } from '../application/services/ReportService.js';
import { JsonServerReportRepository } from '../infrastructure/repositories/JsonServerReportRepository.js';

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
            } catch (error) {
                this.error = error.message;
                console.error('Error fetching reports:', error);
            } finally {
                this.loading = false;
            }
        },

        async generateFullHealthReport() {
            this.loading = true;
            this.error = null;
            try {
                await reportService.generateFullHealthReport(this.selectedFormat);
                await this.fetchReports();
            } catch (error) {
                this.error = error.message;
                console.error('Error generating report:', error);
            } finally {
                this.loading = false;
            }
        },

        async generateSpecificReport(dataTypes) {
            this.loading = true;
            this.error = null;
            try {
                await reportService.generateSpecificReport(dataTypes, this.selectedFormat);
                await this.fetchReports();
            } catch (error) {
                this.error = error.message;
                console.error('Error generating specific report:', error);
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

        async shareReports(message) {
            this.loading = true;
            this.error = null;
            try {
                await reportService.shareSelectedReports(this.selectedReportIds, message);
                await this.fetchReports();
            } catch (error) {
                this.error = error.message;
                console.error('Error sharing reports:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async deleteReport(reportId) {
            try {
                await reportService.deleteReport(reportId);
                await this.fetchReports();
            } catch (error) {
                this.error = error.message;
                console.error('Error deleting report:', error);
            }
        },

        setSelectedFormat(format) {
            this.selectedFormat = format;
        }
    }
});
