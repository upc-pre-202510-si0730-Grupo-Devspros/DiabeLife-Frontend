<script setup>
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import Select from "primevue/select";

// 🎯 Obtenemos locale actual
const { locale } = useI18n();

// Idiomas disponibles
const languages = ref([
  { code: "es", name: "Español" },
  { code: "en", name: "English" }
]);

// Selección inicial
const selected = ref(languages.value.find(l => l.code === locale.value));

// Actualizamos locale al cambiar selección
watch(selected, (newVal) => {
  if (newVal) locale.value = newVal.code;
});
</script>

<template>
  <Select
      v-model="selected"
      :options="languages"
      optionLabel="name"
      optionValue="code"
      class="lang-select"
      appendTo="body"
      placeholder="Idioma"
  />
</template>

<style scoped>
.lang-select {
  min-width: 140px;
  font-size: 0.95rem;
}

.lang-select .p-dropdown-label {
  display: flex;
  align-items: center;
  gap: 6px;
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
