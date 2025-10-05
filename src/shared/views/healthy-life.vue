<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import axios from 'axios'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Button from 'primevue/button'
import Message from 'primevue/message'

const endpoint = 'http://localhost:3000/healthy'
const recEndpoint = 'http://localhost:3000/recommendations'
const foodEndpoint = 'http://localhost:3000/foodData'

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
		const res = await axios.get(endpoint)
		const record = Array.isArray(res.data) ? res.data[0] || {} : res.data
		
		// Don't load data into input fields - keep them empty for new entries
		// Only load summary for display
		summary.heartRate = record.heartRate || 0
		summary.glucose = record.glucose || 0
		summary.weight = record.weight || 0
		summary.bloodPressure = record.bloodPressure || '0/0'

		// load recommendations too
		try {
			const rres = await axios.get(recEndpoint)
			recommendations.splice(0, recommendations.length, ...(Array.isArray(rres.data) ? rres.data : []))
			pickRandomReco()
		} catch (re) {
			console.warn('Cannot load recommendations', re)
		}

		// load food data
		try {
			const fres = await axios.get(foodEndpoint)
			savedFoods.splice(0, savedFoods.length, ...(Array.isArray(fres.data) ? fres.data : []))
		} catch (fe) {
			console.warn('Cannot load food data', fe)
		}
	} catch (e) {
		console.warn('Cannot load healthy data', e)
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
		const res = await axios.get(endpoint)
		const exists = Array.isArray(res.data) ? res.data.length > 0 : !!res.data.id
		const healthPayload = {
			heartRate: data.heartRate,
			glucose: data.glucose,
			weight: data.weight,
			bloodPressure: data.bloodPressure
		}

		if (exists) {
			if (Array.isArray(res.data)) {
				const id = res.data[0].id
				await axios.put(`${endpoint}/${id}`, healthPayload)
			} else {
				await axios.put(endpoint, healthPayload)
			}
		} else {
			await axios.post(endpoint, healthPayload)
		}

		// Update summary immediately with the saved data
		summary.heartRate = data.heartRate || 0
		summary.glucose = data.glucose || 0
		summary.weight = data.weight || 0
		summary.bloodPressure = data.bloodPressure || '0/0'

		// Clear the input fields after saving
		data.heartRate = undefined
		data.glucose = undefined
		data.weight = undefined
		data.bloodPressure = ''

		window.alert('Health data saved successfully')
	} catch (e) {
		console.error('Save health data failed', e)
		window.alert('Save health data failed')
	} finally {
		isLoading.health = false
	}
}

const saveFoodData = async () => {
	if (!foodData.food.trim()) {
		window.alert('Please enter food information')
		return
	}

	isLoading.food = true
	try {
		const foodPayload = {
			food: foodData.food,
			timestamp: new Date().toISOString()
		}
		await axios.post(foodEndpoint, foodPayload)
		foodData.food = '' // Clear the field after saving
		await load() // Reload to show the new food
		pickRandomReco() // Show recommendation after adding food
		window.alert('Food data saved successfully')
	} catch (e) {
		console.error('Save food data failed', e)
		window.alert('Save food data failed')
	} finally {
		isLoading.food = false
	}
}

const formatTimestamp = (timestamp: string | undefined) => {
	if (!timestamp) return 'Unknown time'
	try {
		const date = new Date(timestamp)
		return date.toLocaleString()
	} catch {
		return 'Invalid date'
	}
}

onMounted(load)
</script>

<template>
	<div class="healthy-page p-4">
		<div class="grid">
			<div class="col-12 md:col-4">
				<Card class="mb-3">
					<template #title>Health Metrics</template>
					<template #content>
						<div class="field mb-3">
							<label for="heartRate" class="block mb-2 font-semibold">Heart Rate</label>
							<InputNumber 
								id="heartRate"
								v-model="data.heartRate" 
								placeholder="bpm"
								class="w-full"
								:useGrouping="false"
							/>
						</div>
						<div class="field mb-3">
							<label for="glucose" class="block mb-2 font-semibold">Glucose</label>
							<InputNumber 
								id="glucose"
								v-model="data.glucose" 
								placeholder="mg/dL"
								class="w-full"
								:useGrouping="false"
							/>
						</div>
						<div class="field mb-3">
							<label for="weight" class="block mb-2 font-semibold">Weight</label>
							<InputNumber 
								id="weight"
								v-model="data.weight" 
								placeholder="kg"
								class="w-full"
								:useGrouping="false"
								:minFractionDigits="1"
								:maxFractionDigits="2"
							/>
						</div>
						<div class="field mb-3">
							<label for="bloodPressure" class="block mb-2 font-semibold">Blood Pressure</label>
							<InputText 
								id="bloodPressure"
								v-model="data.bloodPressure" 
								placeholder="mmHg (e.g., 120/80)"
								class="w-full"
							/>
						</div>
					</template>
				</Card>

				<div class="mb-3">
					<Button 
						@click="saveHealthData" 
						label="Save Data" 
						severity="success"
						:loading="isLoading.health"
						class="w-full"
					/>
				</div>
			</div>

			<div class="col-12 md:col-8">
				<Card class="mb-3">
					<template #title>Health Summary</template>
					<template #content>
						<div class="grid">
							<div class="col-6 md:col-3 text-center mb-3">
								<div class="metric-icon heart-icon mb-2">
									<i class="pi pi-heart-fill"></i>
								</div>
								<div class="metric-label">Heart Rate</div>
								<div class="metric-value">{{ summary.heartRate }} bpm</div>
							</div>
							<div class="col-6 md:col-3 text-center mb-3">
								<div class="metric-icon glucose-icon mb-2">
									<i class="pi pi-chart-line"></i>
								</div>
								<div class="metric-label">Glucose</div>
								<div class="metric-value">{{ summary.glucose }} mg/dL</div>
							</div>
							<div class="col-6 md:col-3 text-center mb-3">
								<div class="metric-icon weight-icon mb-2">
									<i class="pi pi-chart-bar"></i>
								</div>
								<div class="metric-label">Weight</div>
								<div class="metric-value">{{ summary.weight }} kg</div>
							</div>
							<div class="col-6 md:col-3 text-center mb-3">
								<div class="metric-icon pressure-icon mb-2">
									<i class="pi pi-arrow-up"></i>
								</div>
								<div class="metric-label">Blood Pressure</div>
								<div class="metric-value">{{ summary.bloodPressure }}</div>
							</div>
						</div>
					</template>
				</Card>

				<Card class="mb-3">
					<template #title>Food Recommendations</template>
					<template #content>
						<div class="field mb-3">
							<label for="food" class="block mb-2 font-semibold">Add Food Consumed</label>
							<InputText 
								id="food"
								v-model="foodData.food" 
								placeholder="Enter food you consumed..."
								class="w-full"
							/>
							<Button 
								@click="saveFoodData" 
								label="Add Food" 
								severity="primary"
								:loading="isLoading.food"
								class="w-full mt-2"
							/>
						</div>
						<Message v-if="currentReco.text !== '—'" severity="info" :closable="false">
							{{ currentReco.text }}
						</Message>
						<div v-else class="text-center text-muted">
							No recommendations available
						</div>
					</template>
				</Card>

				<Card class="mb-3">
					<template #title>Recent Foods</template>
					<template #content>
						<div v-if="savedFoods.length > 0" class="food-list">
							<div 
								v-for="food in savedFoods.slice(-5)" 
								:key="food.id"
								class="food-item mb-2"
							>
								<div class="food-text">{{ food.food }}</div>
								<div class="food-time">{{ formatTimestamp(food.timestamp) }}</div>
							</div>
						</div>
						<div v-else class="text-center text-muted">
							No food data recorded yet
						</div>
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
	background-color: #f7fafc;
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
	color: #718096;
	margin-bottom: 0.25rem;
}

.metric-value {
	font-size: 1.125rem;
	font-weight: 600;
	color: #2d3748;
}

.text-muted {
	color: #718096;
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
	color: #2d3748;
	font-weight: 600;
}

/* Light theme for form inputs */
:deep(.p-inputnumber-input) {
	border-radius: 6px;
	background-color: #ffffff;
	border: 1px solid #d1d5db;
	color: #374151;
}

:deep(.p-inputtext) {
	border-radius: 6px;
	background-color: #ffffff;
	border: 1px solid #d1d5db;
	color: #374151;
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
	color: #374151;
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
	color: #2d3748;
	flex: 1;
}

.food-time {
	font-size: 0.75rem;
	color: #718096;
	margin-left: 1rem;
}
</style>
