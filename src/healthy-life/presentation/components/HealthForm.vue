<script setup lang="ts">
import { defineProps, ref } from 'vue'
const props = defineProps({ modelValue: Object })
const local = ref({ ...props.modelValue })
</script>

<template>
  <div>
    <!-- This component is a simple wrapper; we keep the original inputs in the parent for now -->
    <!-- Kept minimal to avoid duplicating logic in this change set -->
    <slot />
  </div>
</template>

<style scoped>
</style>
