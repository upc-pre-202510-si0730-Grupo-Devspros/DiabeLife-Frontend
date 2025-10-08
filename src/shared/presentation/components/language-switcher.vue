<script setup>
import { useI18n } from "vue-i18n";
import { ref, watch } from "vue";

import Select from 'primevue/select';

const { locale } = useI18n();

const languages = ref([
  { code: "es", name: "Español" },
  { code: "en", name: "English" }
]);

const selected = ref(languages.value.find(l => l.code === locale.value));

watch(selected, (newVal) => {
  if (newVal) locale.value = newVal.code;
});
</script>

<template>
  <Select
      v-model="selected"
      :options="languages"
      optionLabel="name"
      class="lang-select"
  >
    <template #option="slotProps">
      <div class="lang-option">
        <span class="flag">{{ slotProps.option.flag }}</span>
        <span>{{ slotProps.option.name }}</span>
      </div>
    </template>

    <template #value="slotProps">
      <div class="lang-option" v-if="slotProps.value">
        <span class="flag">{{ slotProps.value.flag }}</span>
        <span>{{ slotProps.value.name }}</span>
      </div>
      <span v-else></span>
    </template>
  </Select>
</template>

<style scoped>
.lang-select {
  min-width: 140px;
  max-width: 100%;
  font-size: 0.95rem;
}

.lang-option {
  display: flex;
  align-items: center;
  gap: 6px;
}

.flag {
  font-size: 1.2rem;
}
</style>