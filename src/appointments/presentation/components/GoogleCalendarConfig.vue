<template>
  <div class="google-calendar-config p-4 border border-gray-300 rounded-lg bg-gray-50">
    <h3 class="text-lg font-semibold mb-4 flex items-center">
      <i class="pi pi-calendar mr-2"></i>
      Sincronización Google Calendar
    </h3>
    
    <div v-if="!isConfigured" class="mb-4">
      <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <i class="pi pi-exclamation-triangle text-yellow-400"></i>
          </div>
          <div class="ml-3">
            <p class="text-sm text-yellow-700">
              <strong>Configuración requerida:</strong> Para habilitar la sincronización con Google Calendar, 
              necesitas configurar las credenciales en el archivo .env
            </p>
          </div>
        </div>
      </div>
      
      <div class="space-y-3">
        <p class="text-sm text-gray-600">
          <strong>Pasos para configurar:</strong>
        </p>
        <ol class="list-decimal list-inside text-sm text-gray-700 space-y-1 ml-4">
          <li>Ve a <a href="https://console.cloud.google.com/" target="_blank" class="text-blue-600 hover:underline">Google Cloud Console</a></li>
          <li>Habilita Google Calendar API</li>
          <li>Crea credenciales (API Key + OAuth 2.0 Client ID)</li>
          <li>Actualiza las variables en .env.development</li>
          <li>Reinicia la aplicación</li>
        </ol>
      </div>
    </div>
    
    <div v-else class="space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <div class="w-3 h-3 rounded-full mr-3" :class="syncStatus.color"></div>
          <span class="text-sm font-medium">{{ syncStatus.text }}</span>
        </div>
        
        <Button
          v-if="!isSyncEnabled"
          @click="enableSync"
          :loading="isEnabling"
          severity="success"
          size="small"
          icon="pi pi-check"
          label="Habilitar Sync"
        />
        
        <Button
          v-else
          @click="disableSync"
          severity="secondary"
          size="small"
          icon="pi pi-times"
          label="Deshabilitar"
        />
      </div>
      
      <div v-if="isSyncEnabled" class="text-xs text-gray-600">
        ✓ Las citas se sincronizarán automáticamente con tu Google Calendar
      </div>
      
      <div v-if="lastSyncError" class="bg-red-50 border-l-4 border-red-400 p-3">
        <div class="flex">
          <div class="flex-shrink-0">
            <i class="pi pi-exclamation-circle text-red-400"></i>
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-700">
              <strong>Error de sincronización:</strong> {{ lastSyncError }}
            </p>
          </div>
        </div>
      </div>
    </div>
    
    <div class="mt-4 pt-4 border-t border-gray-200">
      <div class="flex items-center justify-between text-xs text-gray-500">
        <span>Backend principal: {{ backendUrl }}</span>
        <span v-if="isConfigured">Google Calendar: {{ isSyncEnabled ? 'Habilitado' : 'Disponible' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAppointmentStore } from '../../application/appointment.store'
import Button from 'primevue/button'

const appointmentStore = useAppointmentStore()

const isEnabling = ref(false)
const lastSyncError = ref('')

const isConfigured = computed(() => {
  return !!(import.meta.env.VITE_GOOGLE_CALENDAR_API_KEY && import.meta.env.VITE_GOOGLE_CLIENT_ID)
})

const isSyncEnabled = computed(() => {
  // Simplificado para evitar errores si no existe el método
  return appointmentStore.googleCalendarSyncEnabled || false
})

const backendUrl = computed(() => {
  return import.meta.env.VITE_PLATFORM_API_URL
})

const syncStatus = computed(() => {
  if (!isConfigured.value) {
    return {
      text: 'No configurado',
      color: 'bg-gray-400'
    }
  }
  
  if (isSyncEnabled.value) {
    return {
      text: 'Sincronización activa',
      color: 'bg-green-400'
    }
  }
  
  return {
    text: 'Listo para sincronizar',
    color: 'bg-yellow-400'
  }
})

const enableSync = async () => {
  isEnabling.value = true
  lastSyncError.value = ''
  
  try {
    // Simular habilitación por ahora
    appointmentStore.googleCalendarSyncEnabled = true
    console.log('Google Calendar sync enabled (simulated)')
  } catch (error) {
    console.error('Error enabling Google Calendar sync:', error)
    lastSyncError.value = error.message || 'Error desconocido al habilitar la sincronización'
  } finally {
    isEnabling.value = false
  }
}

const disableSync = () => {
  appointmentStore.googleCalendarSyncEnabled = false
  lastSyncError.value = ''
  console.log('Google Calendar sync disabled')
}

onMounted(() => {
  console.log('Google Calendar Config mounted')
  console.log('API Key configured:', !!import.meta.env.VITE_GOOGLE_CALENDAR_API_KEY)
  console.log('Client ID configured:', !!import.meta.env.VITE_GOOGLE_CLIENT_ID)
})
</script>

<style scoped>
.google-calendar-config {
  font-family: 'Inter', sans-serif;
}
</style>