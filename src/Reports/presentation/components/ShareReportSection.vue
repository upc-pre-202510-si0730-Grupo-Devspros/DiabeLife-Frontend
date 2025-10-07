<template>
  <div class="report-section">
    <h2 class="section-title">Share Report</h2>

    <div class="reports-list">
      <div
          v-for="report in reports"
          :key="report.id"
          :class="['report-item', { selected: report.selected, shared: report.shared }]"
          @click="!report.shared && toggleSelection(report.id)"
      >
        <div class="report-info">
          <div class="report-name">{{ report.name }}</div>
          <div class="report-date">{{ report.date }}</div>
        </div>
        <button
            v-if="!report.shared"
            :class="['check-btn', { checked: report.selected }]"
            @click.stop="toggleSelection(report.id)"
        >
          <i class="pi pi-check"></i>
        </button>
        <div v-else class="shared-badge">
          <i class="pi pi-check"></i>
        </div>
      </div>

      <div v-if="!reports.length" class="no-reports">
        No reports available
      </div>
    </div>

    <div class="message-section">
      <label class="message-label">Add message</label>
      <textarea
          v-model="message"
          class="message-input"
          placeholder="Write something..."
          rows="4"
      ></textarea>
    </div>

    <button
        class="share-btn"
        @click="handleShare"
        :disabled="loading || (reports.length === 0 || reports.every(r => r.shared))"
    >
      Share
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useReportStore } from '@/Reports/application/stores/reportStore.js';

const reportStore = useReportStore();
const message = ref('');
const loading = ref(false);

const reports = computed(() => reportStore.reports);
const hasSelectedReports = computed(() => reportStore.selectedReportIds.length > 0);

onMounted(async () => {
  await reportStore.fetchReports();
});

const toggleSelection = async (reportId) => {
  await reportStore.toggleReportSelection(reportId);
};

const handleShare = async () => {
  // Si no hay reportes seleccionados, seleccionar todos los reportes no compartidos
  if (!hasSelectedReports.value) {
    const availableReports = reports.value.filter(r => !r.shared);
    if (availableReports.length === 0) {
      alert('No reports available to share');
      return;
    }
    
    // Seleccionar automáticamente todos los reportes disponibles
    for (const report of availableReports) {
      if (!report.selected) {
        await reportStore.toggleReportSelection(report.id);
      }
    }
  }

  loading.value = true;
  try {
    await reportStore.shareReports(message.value.trim() || 'Shared report');
    message.value = '';
  } catch (error) {
    alert('Error sharing reports');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.report-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
}

.reports-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.report-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  background: #f3f4f6;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.report-item:hover {
  background: #e5e7eb;
}

.report-item.selected {
  background: #d1fae5;
}

.report-item.shared {
  background: #f0fdf4;
  cursor: default;
}

.report-item.shared:hover {
  background: #f0fdf4;
}

.report-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.report-name {
  font-weight: 600;
  color: #1f2937;
  font-size: 1rem;
}

.report-date {
  font-size: 0.875rem;
  color: #6b7280;
}

.check-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid #10b981;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.check-btn i {
  color: transparent;
  font-size: 0.875rem;
  font-weight: bold;
}

.check-btn.checked {
  background: #10b981;
}

.check-btn.checked i {
  color: white;
}

.check-btn:hover {
  transform: scale(1.1);
}

.shared-badge {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #10b981;
  display: flex;
  align-items: center;
  justify-content: center;
}

.shared-badge i {
  color: white;
  font-size: 0.875rem;
  font-weight: bold;
}

.no-reports {
  padding: 2rem;
  text-align: center;
  color: #9ca3af;
  font-style: italic;
}

.message-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.message-label {
  font-weight: 600;
  color: #1f2937;
  font-size: 0.95rem;
}

.message-input {
  width: 100%;
  padding: 0.875rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.95rem;
  resize: vertical;
  transition: all 0.2s;
  background: #f9fafb;
  color: #1f2937;
}

.message-input:focus {
  outline: none;
  border-color: #3b82f6;
  background: white;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.message-input::placeholder {
  color: #9ca3af;
}

.share-btn {
  align-self: flex-end;
  padding: 0.875rem 2.5rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.share-btn:hover:not(:disabled) {
  background: #059669;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.share-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
