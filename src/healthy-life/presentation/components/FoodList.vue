<script setup lang="ts">
import { defineProps } from 'vue'
type Food = { id?: number; food?: string; timestamp?: string }
const props = defineProps<{ foods: Food[]; formatTimestamp: (ts?: string) => string }>()
const foods = props.foods || []
const fmt = props.formatTimestamp
</script>

<template>
  <div>
    <div v-if="foods && foods.length > 0" class="food-list">
      <div v-for="food in foods.slice(-5)" :key="food.id" class="food-item mb-2">
        <div class="food-text">{{ food.food }}</div>
        <div class="food-time">{{ fmt(food.timestamp) }}</div>
      </div>
    </div>
    <div v-else class="text-center text-muted">No food data recorded yet</div>
  </div>
</template>

<style scoped>
</style>
