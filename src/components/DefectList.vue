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

function typeName(typeId: string) {
  const t = defectTypes.value.find(t => t.id === typeId)
  return t ? t.name : typeId
}
</script>

<template>
  <div class="list-box">
    <h2>Дефекты ({{ filtered.length }})</h2>
    <div class="filters">
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
    </div>

    <ul class="defect-list">
      <li v-for="d in filtered" :key="d.id" @click="selectedId = d.id"
        :class="{ selected: d.id === selectedId }">
        <span>{{ d.zone || 'без зоны' }} - {{ typeName(d.typeId) }} - {{ d.severity }}</span>
        <span class="badge" :class="d.status">{{ d.status }}</span>
      </li>
      <li v-if="filtered.length === 0" class="empty">ничего не найдено</li>
    </ul>
  </div>
</template>

<style scoped>
.list-box {
  background: white;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 15px;
}
.list-box h2 {
  margin-top: 0;
}
.filters {
  margin-bottom: 10px;
}
.defect-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.defect-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px 10px;
  margin-bottom: 5px;
  cursor: pointer;
}
.defect-list li:hover {
  background: #f0f0f0;
}
.defect-list li.selected {
  background: #e8f0e8;
  border-color: #5cb85c;
}
.empty {
  color: #888;
  cursor: default;
}
.empty:hover {
  background: white;
}
</style>
