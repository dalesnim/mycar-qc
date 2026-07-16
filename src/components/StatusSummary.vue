<script setup lang="ts">
import { computed } from 'vue'
import { defects } from '../store'
import { countByStatus } from '../summary'
import type { Status } from '../type'

const statuses: Status[] = ['new', 'in_repair', 'resolved', 'rejected']

const summary = computed(() => countByStatus(defects.value))
</script>

<template>
  <div>
    <h2>Сводка</h2>
    <ul>
      <li v-for="s in statuses" :key="s">
        {{ s }}: {{ summary[s] }}
      </li>
      <li>всего: {{ defects.length }}</li>
    </ul>
  </div>
</template>
