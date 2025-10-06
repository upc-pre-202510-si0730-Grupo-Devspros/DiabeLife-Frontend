<template>
  <div class="report-view">
    <div class="reports-container">
      <NewReportSection />
      <div class="divider"></div>
      <ShareReportSection />
    </div>
  </div>
</template>

<script setup>
import NewReportSection from '@/Reports/presentation/components/NewReportSection.vue';
import ShareReportSection from '@/Reports/presentation/components/ShareReportSection.vue';
</script>

<style scoped>
.report-view {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.reports-container {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 2rem;
  align-items: start;
}

.divider {
  width: 1px;
  background: linear-gradient(
      to bottom,
      transparent,
      #e5e7eb 20%,
      #e5e7eb 80%,
      transparent
  );
  height: 100%;
  min-height: 400px;
}

@media (max-width: 968px) {
  .reports-container {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .divider {
    display: none;
  }
}
</style>
