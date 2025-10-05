<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import axios from 'axios'

const endpoint = 'http://localhost:3000/healthy'

type HealthyRecord = { id?: number; heartRate?: number | string; glucose?: number | string; weight?: number | string; bloodPressure?: string }

const data = reactive<HealthyRecord>({ heartRate: '', glucose: '', weight: '', bloodPressure: '' })
const summary = reactive<{ heartRate: number; glucose: number; weight: number; bloodPressure: string }>({ heartRate: 0, glucose: 0, weight: 0, bloodPressure: '0/0' })

const load = async () => {
	try {
		const res = await axios.get(endpoint)
		const record = Array.isArray(res.data) ? res.data[0] || {} : res.data
		data.heartRate = record.heartRate ?? ''
		data.glucose = record.glucose ?? ''
		data.weight = record.weight ?? ''
		data.bloodPressure = record.bloodPressure ?? ''

		summary.heartRate = Number(record.heartRate) || 0
		summary.glucose = Number(record.glucose) || 0
		summary.weight = Number(record.weight) || 0
		summary.bloodPressure = record.bloodPressure || '0/0'
	} catch (e) {
		console.warn('Cannot load healthy data', e)
	}
}

const save = async () => {
	try {
		const res = await axios.get(endpoint)
		const exists = Array.isArray(res.data) ? res.data.length > 0 : !!res.data.id
		const payload = {
			heartRate: data.heartRate,
			glucose: data.glucose,
			weight: data.weight,
			bloodPressure: data.bloodPressure
		}

		if (exists) {
			if (Array.isArray(res.data)) {
				const id = res.data[0].id
				await axios.put(`${endpoint}/${id}`, payload)
			} else {
				await axios.put(endpoint, payload)
			}
		} else {
			await axios.post(endpoint, payload)
		}

		await load()
		window.alert('Data saved')
	} catch (e) {
		console.error('Save failed', e)
		window.alert('Save failed')
	}
}

const addRecord = async () => {
	try {
		const payload = {
			heartRate: data.heartRate,
			glucose: data.glucose,
			weight: data.weight,
			bloodPressure: data.bloodPressure
		}
		await axios.post(endpoint, payload)
		await load()
		window.alert('Record added')
	} catch (e) {
		console.error('Add record failed', e)
		window.alert('Add failed')
	}
}

onMounted(load)
</script>

<template>
	<div class="healthy-page">
		<div class="content-wrap">
			<div class="col left-col">
				<div class="card form-card">
					<div class="form-row">
						<label>Heart Rate</label>
						<input v-model="data.heartRate" placeholder="bpm" />
					</div>
					<div class="form-row">
						<label>Glucose</label>
						<input v-model="data.glucose" placeholder="mg/dL" />
					</div>
					<div class="form-row">
						<label>Weight</label>
						<input v-model="data.weight" placeholder="kg" />
					</div>
					<div class="form-row">
						<label>Blood Pressure</label>
						<input v-model="data.bloodPressure" placeholder="mmHg" />
					</div>
				</div>
			</div>

			<div class="col right-col">
				<div class="card summary-card">
					<ul class="summary-list">
						<li class="item heart"><span class="icon">❤</span> <span class="label">Heart Rate:</span> <strong>{{ summary.heartRate }} bpm</strong></li>
						<li class="item glucose"><span class="icon">💧</span> <span class="label">Glucose:</span> <strong>{{ summary.glucose }} mg/dL</strong></li>
						<li class="item weight"><span class="icon">🔥</span> <span class="label">Weight:</span> <strong>{{ summary.weight }} kg</strong></li>
						<li class="item pressure"><span class="icon">⬆</span> <span class="label">Blood Pressure:</span> <strong>{{ summary.bloodPressure }}</strong></li>
					</ul>
				</div>

				<div class="card reco-card">
					<div class="reco-title">Food Recommendations:</div>
					<div class="reco-body">—</div>
				</div>

				<div class="actions-row">
					<button @click="save" class="btn btn-primary">Save Data</button>
					<button @click="addRecord" class="btn btn-success">Add Record</button>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
.healthy-page { padding: 3rem 2.5rem; }
.content-wrap { display:flex; gap:3rem; align-items:flex-start }
.col { display:flex; flex-direction:column }
.left-col { flex:0 0 320px }
.right-col { flex:1 }
.card { background:#fff; border-radius:8px; padding:1.25rem; box-shadow: 0 6px 18px rgba(0,0,0,0.08); }
.form-card { padding:1.5rem; }
.form-row { margin-bottom:1rem }
.form-row label { display:block; font-weight:700; margin-bottom:0.5rem; color:#2b2b2b }
.form-row input { width:100%; padding:0.6rem 0.75rem; border-radius:12px; border:1px solid #e6eef6; background:#fbfcfe; color:#333 }
.summary-card { margin-bottom:1.25rem }
.summary-list { list-style:none; padding:0; margin:0 }
.summary-list li { display:flex; gap:0.75rem; align-items:center; padding:0.75rem 0 }
.summary-list li + li { margin-top:0.25rem }
.summary-list li .icon { display:inline-flex; width:40px; height:40px; align-items:center; justify-content:center; background:#111; color:#fff; border-radius:50%; font-size:16px }
.summary-list li .label { color:#3b3b3b; margin-right:0.25rem }
.summary-list li strong { color:#111 }
.reco-card { margin-bottom:1.5rem; text-align:center }
.reco-title { font-weight:600; margin-bottom:0.75rem; color:#2b2b2b; font-size:1.1rem }
.reco-body { min-height:48px; color:#555}
.actions-row { display:flex; gap:1rem; align-items:center }
.btn { padding:0.75rem 1.5rem; border-radius:10px; border:none; cursor:pointer; font-weight:600 }
.btn-primary { background:#2b6ce6; color:#fff }
.btn-success { background:#2ec07a; color:#fff }

/* Colored icons per metric to match the design */
.summary-list li.item.heart .icon { background: linear-gradient(135deg,#ff6b6b,#ff2d55); box-shadow: 0 6px 18px rgba(255,107,107,0.12) }
.summary-list li.item.glucose .icon { background: linear-gradient(135deg,#00c6ff,#0072ff); box-shadow: 0 6px 18px rgba(0,198,255,0.12) }
.summary-list li.item.weight .icon { background: linear-gradient(135deg,#ff9a3c,#ff6a00); box-shadow: 0 6px 18px rgba(255,154,60,0.12) }
.summary-list li.item.pressure .icon { background: linear-gradient(135deg,#2ee6b6,#00b894); box-shadow: 0 6px 18px rgba(46,230,182,0.12) }

/* Slightly stronger card shadows to match Figma */
.form-card, .summary-card, .reco-card { box-shadow: 0 10px 30px rgba(18,25,34,0.06); border-radius:12px }

@media (max-width: 900px) {
	.content-wrap { flex-direction:column }
	.left-col { flex:unset }
}
</style>
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+
+ 
