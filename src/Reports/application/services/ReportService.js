export class ReportService {
    constructor(reportRepository) {
        this.reportRepository = reportRepository;
    }

    async getAllReports() {
        return await this.reportRepository.getAll();
    }

    async createReport(reportData) {
        return await this.reportRepository.create(reportData);
    }

    async generateFullHealthReport(type = 'PDF') {
        const reports = await this.reportRepository.getAll();
        const reportNumber = reports.length + 1;

        const reportData = {
            name: `Full Health Report ${reportNumber}`,
            date: new Date().toLocaleDateString('en-GB'),
            type: type.toUpperCase(),
            data: ['glucose', 'weight', 'blood_pressure', 'heart_rate'], // Todos los datos
            selected: false,
            shared: false
        };

        return await this.reportRepository.create(reportData);
    }

    async generateSpecificReport(dataTypes, type = 'PDF') {
        const reports = await this.reportRepository.getAll();
        const reportNumber = reports.length + 1;
        
        // Crear nombre descriptivo basado en los datos seleccionados
        const dataLabels = {
            'glucose': 'Glucose',
            'weight': 'Weight', 
            'blood_pressure': 'Blood Pressure',
            'heart_rate': 'Heart Rate'
        };
        
        const selectedLabels = dataTypes.map(type => dataLabels[type]).join(', ');
        const reportName = `${selectedLabels} Report ${reportNumber}`;

        const reportData = {
            name: reportName,
            date: new Date().toLocaleDateString('en-GB'),
            type: type.toUpperCase(),
            data: dataTypes, // Array con los tipos de datos seleccionados
            selected: false,
            shared: false
        };

        return await this.reportRepository.create(reportData);
    }

    async toggleReportSelection(reportId) {
        const report = await this.reportRepository.getById(reportId);
        report.toggleSelection();
        return await this.reportRepository.update(reportId, report);
    }

    async shareSelectedReports(reportIds, message) {
        return await this.reportRepository.shareReports(reportIds, message);
    }

    async deleteReport(reportId) {
        return await this.reportRepository.delete(reportId);
    }
}
