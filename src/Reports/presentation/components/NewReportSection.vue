<template>
  <div class="report-section">
    <h2 class="section-title">New Report</h2>

    <div class="format-selector">
      <button
          :class="['format-btn', { active: selectedFormat === 'PDF' }]"
          @click="selectedFormat = 'PDF'"
      >
        <i class="pi pi-circle-fill"></i>
        PDF
      </button>
      <button
          :class="['format-btn', { active: selectedFormat === 'WORD' }]"
          @click="selectedFormat = 'WORD'"
      >
        <i class="pi pi-circle-fill"></i>
        WORD
      </button>
    </div>

    <div class="report-options">
      <div class="option-row">
        <span class="option-label">All the data</span>
        <button
            class="generate-full-btn"
            @click="handleGenerateFullReport"
            :disabled="loading"
        >
          Generate full health report
        </button>
      </div>

      <div class="option-row">
        <span class="option-label">Specific data</span>
        <div class="checkboxes-container">
          <label
              v-for="option in dataOptions"
              :key="option.value"
              class="checkbox-label"
          >
            <input
                type="checkbox"
                :value="option.value"
                v-model="selectedDataTypes"
                class="checkbox-input"
            />
            <span class="checkbox-text">{{ option.label }}</span>
          </label>
        </div>
      </div>

      <button
          class="generate-btn"
          @click="handleGenerateSpecificReport"
          :disabled="loading || selectedDataTypes.length === 0"
      >
        Generate
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useReportStore } from '@/Reports/application/stores/reportStore.js';

const reportStore = useReportStore();
const selectedFormat = ref('PDF');
const selectedDataTypes = ref([]);
const loading = ref(false);

const dataOptions = [
  { label: 'Glucose levels', value: 'glucose' },
  { label: 'Weight', value: 'weight' },
  { label: 'Blood pressure', value: 'blood_pressure' },
  { label: 'Heart rate', value: 'heart_rate' }
];

watch(selectedFormat, (newFormat) => {
  reportStore.setSelectedFormat(newFormat);
});

const handleGenerateFullReport = async () => {
  loading.value = true;
  try {
    await reportStore.generateFullHealthReport();
  } finally {
    loading.value = false;
  }
};

const handleGenerateSpecificReport = async () => {
  if (selectedDataTypes.value.length === 0) return;

  loading.value = true;
  try {
    await reportStore.generateSpecificReport(selectedDataTypes.value);
    selectedDataTypes.value = [];
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
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #1f2937;
}

.format-selector {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  background: #f3f4f6;
  padding: 0.25rem;
  border-radius: 8px;
}

.format-btn {
  flex: 1;
  padding: 0.75rem 1.5rem;
  border: none;
  background: transparent;
  color: #6b7280;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.format-btn i {
  font-size: 0.5rem;
}

.format-btn.active {
  background: white;
  color: #3b82f6;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.format-btn.active i {
  color: #3b82f6;
}

.report-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.option-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.option-label {
  font-weight: 500;
  color: #1f2937;
  min-width: 120px;
}

.generate-full-btn {
  flex: 1;
  padding: 0.75rem 1.5rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.generate-full-btn:hover:not(:disabled) {
  background: #059669;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.generate-full-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.checkboxes-container {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 0.5rem 0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
}

.checkbox-input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #3b82f6;
}

.checkbox-text {
  color: #374151;
  font-size: 0.95rem;
}

.generate-btn {
  align-self: flex-start;
  padding: 0.75rem 2rem;
  background: #93c5fd;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-left: 136px;
}

.generate-btn:hover:not(:disabled) {
  background: #60a5fa;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(147, 197, 253, 0.4);
}

.generate-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
