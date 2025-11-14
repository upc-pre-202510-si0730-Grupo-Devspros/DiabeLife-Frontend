import { defineStore } from 'pinia'
import { reactive } from 'vue'
import api from '../infrastructure/healthy-life.api'
import { toHealthyRequest, toHealthyResource, toFoodResource } from '../infrastructure/healthy-life.assembler'

export const useHealthyStore = defineStore('healthy', () => {
  const state = reactive({
    data: toHealthyResource(null),
    summary: toHealthyResource(null),
    recommendations: [],
    savedFoods: [],
    loading: false,
    error: null
  })

  const load = async () => {
    state.loading = true
    state.error = null
    
    try {
      // Cargar métricas de salud más recientes
      const healthRes = await api.getLatestHealthMetric()
      const record = healthRes.data || {}
      state.summary = toHealthyResource(record)

      // Cargar recomendaciones
      const rres = await api.getRecommendations()
      state.recommendations.splice(0, state.recommendations.length, ...(Array.isArray(rres.data) ? rres.data : []))

      // Cargar datos de comida recientes
      const fres = await api.getRecentFoodData()
      const foods = Array.isArray(fres.data) ? fres.data.map(toFoodResource) : []
      state.savedFoods.splice(0, state.savedFoods.length, ...foods)
      
    } catch (error) {
      console.error('Error loading healthy data:', error)
      state.error = 'Error al cargar los datos de salud'
    } finally {
      state.loading = false
    }
  }

  const saveHealth = async (input) => {
    state.loading = true
    state.error = null
    
    try {
      const payload = toHealthyRequest(input)
      await api.createHealthMetric(payload)
      state.summary = toHealthyResource(payload)
    } catch (error) {
      console.error('Error saving health metric:', error)
      state.error = 'Error al guardar las métricas de salud'
      throw error
    } finally {
      state.loading = false
    }
  }

  const addFood = async (food) => {
    state.loading = true
    state.error = null
    
    try {
      await api.createFoodData({ 
        name: food.name || food,
        calories: food.calories || 0,
        timestamp: new Date().toISOString() 
      })
      await load() // Recargar datos
    } catch (error) {
      console.error('Error adding food:', error)
      state.error = 'Error al agregar comida'
      throw error
    } finally {
      state.loading = false
    }
  }

  const updateHealthMetric = async (id, data) => {
    state.loading = true
    state.error = null
    
    try {
      await api.updateHealthMetric(id, data)
      await load() // Recargar datos
    } catch (error) {
      console.error('Error updating health metric:', error)
      state.error = 'Error al actualizar métrica de salud'
      throw error
    } finally {
      state.loading = false
    }
  }

  const deleteHealthMetric = async (id) => {
    state.loading = true
    state.error = null
    
    try {
      await api.deleteHealthMetric(id)
      await load() // Recargar datos
    } catch (error) {
      console.error('Error deleting health metric:', error)
      state.error = 'Error al eliminar métrica de salud'
      throw error
    } finally {
      state.loading = false
    }
  }

  return { 
    state, 
    load, 
    saveHealth, 
    addFood, 
    updateHealthMetric, 
    deleteHealthMetric 
  }
})
