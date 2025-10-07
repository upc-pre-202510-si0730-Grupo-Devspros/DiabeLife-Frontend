import { defineStore } from 'pinia'
import { reactive } from 'vue'
import api from '../infrastructure/healthy-life.api'
import { toHealthyRequest, toHealthyResource, toFoodResource } from '../infrastructure/healthy-life.assembler'

export const useHealthyStore = defineStore('healthy', () => {
  const state = reactive({
    data: toHealthyResource(null),
    summary: toHealthyResource(null),
    recommendations: [],
    savedFoods: []
  })

  const load = async () => {
    const res = await api.getHealthy()
    const record = Array.isArray(res.data) ? res.data[0] || {} : res.data
    state.summary = toHealthyResource(record)

    const rres = await api.getRecommendations()
    state.recommendations.splice(0, state.recommendations.length, ...(Array.isArray(rres.data) ? rres.data : []))

    const fres = await api.getFoodData()
    const foods = Array.isArray(fres.data) ? fres.data.map(toFoodResource) : []
    state.savedFoods.splice(0, state.savedFoods.length, ...foods)
  }

  const saveHealth = async (input) => {
    const res = await api.getHealthy()
    const exists = Array.isArray(res.data) ? res.data.length > 0 : !!res.data.id
    const payload = toHealthyRequest(input)
    if (exists) {
      const id = Array.isArray(res.data) ? res.data[0].id : res.data.id
      if (id) await api.updateHealthy(id, payload)
    } else {
      await api.createHealthy(payload)
    }

    state.summary = toHealthyResource(payload)
  }

  const addFood = async (food) => {
    await api.createFoodData({ food, timestamp: new Date().toISOString() })
    await load()
  }

  return { state, load, saveHealth, addFood }
})
