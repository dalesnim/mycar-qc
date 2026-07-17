<script setup lang="ts">
import { onMounted } from 'vue'
import CarMap from './components/CarMap.vue'
import DefectCard from './components/DefectCard.vue'
import DefectList from './components/DefectList.vue'
import StatusSummary from './components/StatusSummary.vue'
import { loadAll } from './store'

onMounted(loadAll)
</script>

<template>
<h1> My Car Quality Control </h1>
<div class="layout">
  <CarMap />
  <div class="panel">
    <DefectCard />
    <DefectList/>
    <StatusSummary/>
    <a href="http://localhost:3000/inspections/VIN1/pdi-report" target="_blank">Отчёт PDI</a>
  </div>
</div>
</template>

<style>
body {
  font-family: Arial, sans-serif;
  background: white;
  color: black;
  margin: 20px;
}
h1 {
  font-size: 24px;
}
.layout {
  display: flex;
  gap: 40px;
  align-items: flex-start;
}
.panel {
  flex: 1;
  max-width: 500px;
}
button {
  margin-right: 5px;
  margin-top: 5px;
}
select {
  margin-right: 5px;
}
</style>
