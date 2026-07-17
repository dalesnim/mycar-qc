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
<CarMap />
<DefectCard />
<DefectList/>
<StatusSummary/>
<a href="http://localhost:3000/inspections/VIN1/pdi-report" target="_blank">Отчёт PDI</a>
</template>

<style>

</style>
