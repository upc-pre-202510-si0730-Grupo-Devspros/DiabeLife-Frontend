<template>
  <div class="report-section">
    <h2 class="section-title">{{ t('report.title') }}</h2>

    <div class="format-selector">
      <button
          :class="['format-btn', { active: selectedFormat === 'PDF' }]"
          @click="selectedFormat = 'PDF'"
      >
        <i class="pi pi-circle-fill"></i>
        {{ t('report.pdf') }}
      </button>
      <button
          :class="['format-btn', { active: selectedFormat === 'WORD' }]"
          @click="selectedFormat = 'WORD'"
      >
        <i class="pi pi-circle-fill"></i>
        {{ t('report.word') }}
      </button>
    </div>

    <div class="report-options">
      <div class="option-row">
        <span class="option-label">{{ t('report.allData') }}</span>
        <button
            class="generate-full-btn"
            @click="handleGenerateFullReport"
            :disabled="reportStore.loading"
        >
          {{ t('report.generateFull') }}
        </button>
      </div>

      <div class="option-row">
        <span class="option-label">{{ t('report.specificData') }}</span>
        <div class="dropdown-container">
          <button
              class="dropdown-toggle"
              @click="toggleDataOptions"
              :class="{ active: showDataOptions }"
          >
            {{ selectedDataText }}
            <i class="pi pi-chevron-down" :class="{ rotated: showDataOptions }"></i>
          </button>

          <div v-if="showDataOptions" class="dropdown-options">
            <label
                v-for="option in dataOptions"
                :key="option.value"
                class="dropdown-option"
            >
              <input
                  type="checkbox"
                  :value="option.value"
                  v-model="selectedDataTypes"
                  class="checkbox-input"
              />
              <span class="checkbox-text">{{ t(option.label) }}</span>
            </label>
          </div>
        </div>
      </div>

      <button
          class="generate-btn"
          @click="handleGenerateSpecificReport"
          :disabled="reportStore.loading || selectedDataTypes.length === 0"
      >
        {{ t('report.generate') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useReportStore } from '@/Reports/application/stores/reportStore.js'

const { t } = useI18n()
const reportStore = useReportStore()

const selectedFormat = ref('PDF')
const selectedDataTypes = ref([])
const showDataOptions = ref(false)

const dataOptions = [
  { label: 'report.glucose', value: 'glucose' },
  { label: 'report.weight', value: 'weight' },
  { label: 'report.bloodPressure', value: 'blood_pressure' },
  { label: 'report.heartRate', value: 'heart_rate' }
]

const selectedDataText = computed(() => {
  if (selectedDataTypes.value.length === 0) {
    return t('report.selectData')
  }
  return selectedDataTypes.value
      .map(type => t(dataOptions.find(option => option.value === type)?.label))
      .join(', ')
})

const toggleDataOptions = () => {
  showDataOptions.value = !showDataOptions.value
}

watch(selectedFormat, (newFormat) => {
  reportStore.setSelectedFormat(newFormat)
})

const handleGenerateFullReport = async () => {
  try {
    await reportStore.generateFullHealthReport()
  } catch (error) {
    console.error('Error generating full report:', error)
  }
}

const handleGenerateSpecificReport = async () => {
  if (selectedDataTypes.value.length === 0) return
  try {
    await reportStore.generateSpecificReport(selectedDataTypes.value)
    selectedDataTypes.value = []
  } catch (error) {
    console.error('Error generating specific report:', error)
  }
}
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

.dropdown-container {
  flex: 1;
  position: relative;
}

.dropdown-toggle {
  width: 100%;
  padding: 0.75rem 1rem;
  background: #f8f9fa;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.95rem;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-align: left;
}

.dropdown-toggle:hover {
  border-color: #d1d5db;
  background: #f3f4f6;
}

.dropdown-toggle.active {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.dropdown-toggle i {
  transition: transform 0.2s;
  font-size: 0.875rem;
}

.dropdown-toggle i.rotated {
  transform: rotate(180deg);
}

.dropdown-options {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 10;
  margin-top: 0.25rem;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.dropdown-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background 0.2s;
}

.dropdown-option:hover {
  background: #f3f4f6;
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
