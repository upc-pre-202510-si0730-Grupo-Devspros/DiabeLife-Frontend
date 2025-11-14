<script setup lang="ts">
import { reactive, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/userManagment/application/user.store.js'
import api from '../../infrastructure/healthy-life.api'
import { toHealthyRequest, toHealthyResource, toFoodResource } from '../../infrastructure/healthy-life.assembler'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Button from 'primevue/button'
import Message from 'primevue/message'
import HealthSummary from '../components/HealthSummary.vue'
import FoodList from '../components/FoodList.vue'

const { t } = useI18n()
const auth = useAuthStore()

type HealthyRecord = { id?: number; heartRate?: number; glucose?: number; weight?: number; bloodPressure?: string }
type FoodRecord = { id?: number; food?: string; timestamp?: string }

const data = reactive<HealthyRecord>({ heartRate: undefined, glucose: undefined, weight: undefined, bloodPressure: '' })
const foodData = reactive<{ food: string }>({ food: '' })
const summary = reactive<{ heartRate: number; glucose: number; weight: number; bloodPressure: string }>({ heartRate: 0, glucose: 0, weight: 0, bloodPressure: '0/0' })
const recommendations = reactive<Array<{ id?: number; text: string }>>([])
const currentReco = reactive<{ text: string }>({ text: '—' })
const savedFoods = reactive<Array<FoodRecord>>([])
const isLoading = reactive<{ health: boolean; food: boolean }>({ health: false, food: false })

const load = async () => {
  try {
    console.log('=== CARGANDO DATOS DE SALUD ===')
    
    // Cargar la última métrica de salud
    try {
      const healthRes = await api.getLatestHealthMetric()
      console.log('Latest health metrics response:', healthRes.data)
      
      if (healthRes.data) {
        const resource = toHealthyResource(healthRes.data)
        console.log('Processed health resource:', resource)
        
        summary.heartRate = resource.heartRate || 0
        summary.glucose = resource.glucose || 0
        summary.weight = resource.weight || 0
        summary.bloodPressure = resource.bloodPressure || '0/0'
        
        console.log('Updated summary:', { 
          heartRate: summary.heartRate, 
          glucose: summary.glucose, 
          weight: summary.weight, 
          bloodPressure: summary.bloodPressure 
        })
      } else {
        console.log('No health metrics found, keeping defaults')
      }
    } catch (he) {
      console.warn('Cannot load latest health metrics:', he)
      
      // Intentar cargar todas las métricas y tomar la más reciente
      try {
        const allHealthRes = await api.getHealthMetrics()
        console.log('All health metrics:', allHealthRes.data)
        
        if (allHealthRes.data && Array.isArray(allHealthRes.data) && allHealthRes.data.length > 0) {
          // Tomar el más reciente (asumir que está ordenado o tomar el último)
          const latestMetric = allHealthRes.data[allHealthRes.data.length - 1]
          const resource = toHealthyResource(latestMetric)
          
          summary.heartRate = resource.heartRate || 0
          summary.glucose = resource.glucose || 0
          summary.weight = resource.weight || 0
          summary.bloodPressure = resource.bloodPressure || '0/0'
          
          console.log('Used latest from all metrics:', resource)
        }
      } catch (allError) {
        console.warn('Cannot load any health metrics:', allError)
      }
    }

    // Cargar recomendaciones
    try {
      const rres = await api.getRecommendations()
      console.log('Recommendations:', rres.data)
      recommendations.splice(0, recommendations.length, ...(Array.isArray(rres.data) ? rres.data : []))
      pickRandomReco()
    } catch (re) {
      console.warn('Cannot load recommendations', re)
    }

    // Cargar comida reciente
    try {
      const fres = await api.getRecentFoodData()
      console.log('Recent food data:', fres.data)
      const foods = Array.isArray(fres.data) ? fres.data.map(toFoodResource) : []
      savedFoods.splice(0, savedFoods.length, ...foods)
    } catch (fe) {
      console.warn('Cannot load food data', fe)
      
      // Intentar cargar toda la comida si /recent no funciona
      try {
        const allFoodRes = await api.getFoodData()
        console.log('All food data:', allFoodRes.data)
        const foods = Array.isArray(allFoodRes.data) ? allFoodRes.data.map(toFoodResource) : []
        savedFoods.splice(0, savedFoods.length, ...foods)
      } catch (allFoodError) {
        console.warn('Cannot load any food data:', allFoodError)
      }
    }
    
    console.log('=== DATOS CARGADOS EXITOSAMENTE ===')
  } catch (e) {
    console.error('Error general loading data:', e)
  }
}

const pickRandomReco = () => {
  if (!recommendations || recommendations.length === 0) {
    currentReco.text = '—'
    return
  }
  const idx = Math.floor(Math.random() * recommendations.length)
  currentReco.text = recommendations[idx].text || '—'
}

const saveHealthData = async () => {
  isLoading.health = true
  try {
    console.log('=== GUARDANDO DATOS DE SALUD ===')
    console.log('Datos a guardar:', data)
    
    const healthPayload = toHealthyRequest(data)
    console.log('Payload procesado:', healthPayload)
    
    // Crear nueva métrica de salud
    const response = await api.createHealthMetric(healthPayload)
    console.log('Respuesta del servidor:', response.data)

    // Actualizar el summary inmediatamente con los datos guardados
    summary.heartRate = data.heartRate || 0
    summary.glucose = data.glucose || 0
    summary.weight = data.weight || 0
    summary.bloodPressure = data.bloodPressure || '0/0'
    
    console.log('Summary actualizado:', { 
      heartRate: summary.heartRate, 
      glucose: summary.glucose, 
      weight: summary.weight, 
      bloodPressure: summary.bloodPressure 
    })

    // Limpiar el formulario
    data.heartRate = undefined
    data.glucose = undefined
    data.weight = undefined
    data.bloodPressure = ''

    // Recargar datos para asegurar sincronización
    await load()

    window.alert(t('healthyLife.healthSaved'))
    console.log('=== DATOS DE SALUD GUARDADOS EXITOSAMENTE ===')
  } catch (e) {
    console.error('Save health data failed', e)
    console.error('Error details:', e.response?.data)
    
    let errorMessage = t('healthyLife.healthSaveError')
    if (e.response?.data?.message) {
      errorMessage += ': ' + e.response.data.message
    } else if (e.response?.status === 400) {
      errorMessage += ': Datos inválidos. Verifica que todos los campos tengan valores válidos.'
    } else {
      errorMessage += ': ' + e.message
    }
    
    window.alert(errorMessage)
  } finally {
    isLoading.health = false
  }
}

const saveFoodData = async () => {
  if (!foodData.food.trim()) {
    window.alert(t('healthyLife.foodRequired'))
    return
  }

  isLoading.food = true
  try {
    // Vamos a probar diferentes formatos hasta encontrar el correcto
    const foodPayload1 = {
      name: foodData.food.trim(),
      calories: 0,
      timestamp: new Date().toISOString()
    }
    
    const foodPayload2 = {
      food: foodData.food.trim(),
      calories: 0,
      timestamp: new Date().toISOString()
    }
    
    const foodPayload3 = {
      Name: foodData.food.trim(),
      Calories: 0,
      Timestamp: new Date().toISOString()
    }
    
    const foodPayload4 = {
      name: foodData.food.trim()
    }
    
    console.log('Probando formato 1 (name):', foodPayload1)
    
    try {
      await api.createFoodData(foodPayload1)
      console.log('Formato 1 funcionó!')
    } catch (err1) {
      console.log('Formato 1 falló:', err1.response?.data)
      
      try {
        console.log('Probando formato 2 (food):', foodPayload2)
        await api.createFoodData(foodPayload2)
        console.log('Formato 2 funcionó!')
      } catch (err2) {
        console.log('Formato 2 falló:', err2.response?.data)
        
        try {
          console.log('Probando formato 3 (PascalCase):', foodPayload3)
          await api.createFoodData(foodPayload3)
          console.log('Formato 3 funcionó!')
        } catch (err3) {
          console.log('Formato 3 falló:', err3.response?.data)
          
          try {
            console.log('Probando formato 4 (solo name):', foodPayload4)
            await api.createFoodData(foodPayload4)
            console.log('Formato 4 funcionó!')
          } catch (err4) {
            console.log('Formato 4 falló:', err4.response?.data)
            throw err4 // Si todos fallan, lanzar el último error
          }
        }
      }
    }
    
    window.alert(t('healthyLife.foodSaved'))
  } catch (e) {
    console.error('Save food data failed', e)
    console.error('Error details:', e.response?.data)
    window.alert(t('healthyLife.foodSaveError') + ': ' + (e.response?.data?.message || e.message))
  } finally {
    isLoading.food = false
  }
}

const formatTimestamp = (timestamp: string | undefined) => {
  if (!timestamp) return t('healthyLife.unknownTime')
  try {
    const date = new Date(timestamp)
    return date.toLocaleString()
  } catch {
    return t('healthyLife.invalidDate')
  }
}

// Cargar datos cuando el componente se monta
onMounted(async () => {
  console.log('Componente montado, cargando datos...')
  await load()
})

// Recargar datos cuando el usuario cambie (login/logout)
watch(() => auth.user, async (newUser, oldUser) => {
  console.log('Usuario cambió:', { newUser: !!newUser, oldUser: !!oldUser })
  if (newUser !== oldUser) {
    await load()
  }
}, { immediate: false })
</script>

<template>
  <div class="healthy-page p-4">
    <div class="grid">
      <div class="col-12 md:col-4">
        <Card class="mb-3">
          <template #title>{{ t('healthyLife.healthMetrics') }}</template>
          <template #content>
            <div class="field mb-3">
              <label for="heartRate">{{ t('healthyLife.heartRate') }}</label>
              <InputNumber v-model="data.heartRate" placeholder="bpm" class="w-full" :useGrouping="false" />
            </div>
            <div class="field mb-3">
              <label for="glucose">{{ t('healthyLife.glucose') }}</label>
              <InputNumber v-model="data.glucose" placeholder="mg/dL" class="w-full" :useGrouping="false" />
            </div>
            <div class="field mb-3">
              <label for="weight">{{ t('healthyLife.weight') }}</label>
              <InputNumber v-model="data.weight" placeholder="kg" class="w-full" :useGrouping="false" />
            </div>
            <div class="field mb-3">
              <label for="bloodPressure">{{ t('healthyLife.bloodPressure') }}</label>
              <InputText v-model="data.bloodPressure" placeholder="mmHg (e.g., 120/80)" class="w-full" />
            </div>
          </template>
        </Card>

        <Button
            @click="saveHealthData"
            :label="t('healthyLife.saveData')"
            severity="success"
            :loading="isLoading.health"
            class="w-full mb-3"
        />
      </div>

      <div class="col-12 md:col-8">
        <Card class="mb-3">
          <template #title>{{ t('healthyLife.healthSummary') }}</template>
          <template #content>
            <HealthSummary :summary="summary" />
          </template>
        </Card>

        <Card class="mb-3">
          <template #title>{{ t('healthyLife.foodRecommendations') }}</template>
          <template #content>
            <div class="field mb-3">
              <label for="food">{{ t('healthyLife.addFood') }}</label>
              <InputText v-model="foodData.food" :placeholder="t('healthyLife.foodPlaceholder')" class="w-full" />
              <Button
                  @click="saveFoodData"
                  :label="t('healthyLife.addFoodBtn')"
                  severity="primary"
                  :loading="isLoading.food"
                  class="w-full mt-2"
              />
            </div>
            
            <Message v-if="currentReco.text !== '—'" severity="info" :closable="false">
              {{ currentReco.text }}
            </Message>
            <div v-else class="text-center text-muted">
              {{ t('healthyLife.noRecommendations') }}
            </div>
          </template>
        </Card>

        <Card class="mb-3">
          <template #title>{{ t('healthyLife.recentFoods') }}</template>
          <template #content>
            <FoodList :foods="savedFoods" :formatTimestamp="formatTimestamp" />
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>


<style scoped>
.healthy-page {
	max-width: 1200px;
	margin: 0 auto;
	background-color: #f5f6fa;
	min-height: 100vh;
	padding: 2rem;
}

.metric-icon {
	width: 60px;
	height: 60px;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	margin: 0 auto;
	font-size: 1.5rem;
	color: white;
}

.heart-icon {
	background: #e53e3e;
}

.glucose-icon {
	background: #3182ce;
}

.weight-icon {
	background: #dd6b20;
}

.pressure-icon {
	background: #38a169;
}

.metric-label {
	font-size: 0.875rem;
	color: #000000;
	margin-bottom: 0.25rem;
}

.metric-value {
	font-size: 1.125rem;
	font-weight: 600;
	color: #000000;
}

.text-muted {
	color: #000000;
}

/* Light theme for cards */
:deep(.p-card) {
	background-color: #ffffff;
	border: 1px solid #e2e8f0;
	border-radius: 8px;
	box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

:deep(.p-card-body) {
	padding: 1.5rem;
}

:deep(.p-card-title) {
	margin-bottom: 1rem;
	color: #000000;
	font-weight: 600;
}

/* Light theme for form inputs */
:deep(.p-inputnumber-input) {
	border-radius: 6px;
	background-color: #ffffff;
	border: 1px solid #d1d5db;
	color: #000000;
}

:deep(.p-inputtext) {
	border-radius: 6px;
	background-color: #ffffff;
	border: 1px solid #d1d5db;
	color: #000000;
}

:deep(.p-inputnumber-input:focus) {
	border-color: #3b82f6;
	box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

:deep(.p-inputtext:focus) {
	border-color: #3b82f6;
	box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

/* Labels */
:deep(label) {
	color: #000000;
	font-weight: 500;
}

/* Button styling */
:deep(.p-button) {
	border-radius: 6px;
	font-weight: 600;
	border: none;
	padding: 0.75rem 1.5rem;
}

:deep(.p-button-primary) {
	background-color: #3b82f6;
	color: #ffffff;
}

:deep(.p-button-success) {
	background-color: #10b981;
	color: #ffffff;
}

/* Message component for recommendations */
:deep(.p-message) {
	background-color: #dbeafe;
	border: 1px solid #93c5fd;
	color: #1e40af;
	border-radius: 6px;
}

:deep(.p-message .p-message-text) {
	color: #1e40af;
}

:deep(.p-message .p-message-icon) {
	color: #3b82f6;
}

/* Food list styling */
.food-list {
	max-height: 300px;
	overflow-y: auto;
}

.food-item {
	background-color: #f8fafc;
	border: 1px solid #e2e8f0;
	border-radius: 6px;
	padding: 0.75rem;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.food-text {
	font-weight: 500;
	color: #000000;
	flex: 1;
}

.food-time {
	font-size: 0.75rem;
	color: #000000;
	margin-left: 1rem;
}

/* Ensure most text inside Healthy Life is black by default */
.healthy-page,
.healthy-page :where(*) {
	color: #000000;
}
</style>
