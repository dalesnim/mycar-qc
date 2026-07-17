<script setup lang="ts">
import { defects, selectedId, defectTypes } from '../store'
import { ref, computed } from 'vue'

const filterType = ref('')
const filterStatus = ref('')

const filtered = computed(() =>
  defects.value.filter(d =>
    (filterType.value === '' || d.typeId === filterType.value) && (filterStatus.value === '' || d.status === filterStatus.value)
  )
)
</script>

<template>
    <select v-model="filterStatus">
  <option value="">Все статусы</option>
  <option value="new">new</option>
  <option value="in_repair">in_repair</option>
  <option value="resolved">resolved</option>
  <option value="rejected">rejected</option>
</select>

<select v-model="filterType">
  <option value="">Все типы</option>
  <option v-for="t in defectTypes" :key="t.id" :value="t.id">
    {{ t.name }}
  </option>
</select>

    <ul>
  <li v-for="d in filtered" :key="d.id" @click="selectedId = d.id"> 
    {{ d.zone || 'без зоны' }} — {{ d.severity }} — {{ d.status }}
  </li>
</ul>
</template>