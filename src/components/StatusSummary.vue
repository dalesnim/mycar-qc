<script setup lang="ts">
import { computed } from 'vue'
import { defects } from '../store'
import type { Status } from '../type'

const statuses: Status[] = ['new', 'in_repair', 'resolved', 'rejected']

// считаем колличество дефектов по каждому статусу
const summery = computed(() => {
  const counts: Record<Status, number> = {
    new: 0,
    in_repair: 0,
    resolved: 0,
    rejected: 0,
  }
  for (const d of defects.value) {
    counts[d.status]++
  }
  return counts
})
</script>

<template>
  <div>
    <h2>Сводка</h2>
    <ul>
      <li v-for="s in statuses" :key="s">
        {{ s }}: {{ summery[s] }}
      </li>
      <li>всего: {{ defects.length }}</li>
    </ul>
  </div>
</template>
