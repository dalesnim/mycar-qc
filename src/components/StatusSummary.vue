<script setup lang="ts">
import { computed } from 'vue'
import { defects } from '../store'
import { countByStatus, isFit } from '../summary'
import type { Status } from '../type'

const statuses: Status[] = ['new', 'in_repair', 'resolved', 'rejected']

const summary = computed(() => countByStatus(defects.value))
const fit = computed(() => isFit(defects.value))
</script>

<template>
  <div>
    <h2>Сводка</h2>
    <ul>
      <li v-for="s in statuses" :key="s">
        <span class="badge" :class="s">{{ s }}</span> {{ summary[s] }}
      </li>
      <li>Всего: {{ defects.length }}</li>
    </ul>
    <p :class="fit ? 'fit' : 'notfit'">
      Годен к выдаче: {{ fit ? 'ДА' : 'НЕТ' }}
    </p>
  </div>
</template>

<style scoped>
ul {
  list-style: none;
  padding: 0;
}
li {
  margin-bottom: 4px;
}
.fit {
  color: green;
  font-weight: bold;
}
.notfit {
  color: red;
  font-weight: bold;
}
</style>
