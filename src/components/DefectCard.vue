<script setup lang="ts">
import {defects,selectedId} from "../store"
import {computed} from 'vue'
import { defectTypes } from '../data'

const defect = computed(() =>
  defects.value.find(d => d.id === selectedId.value)
)
</script>

<template>
    <div v-if="selectedId">
    <h2>Дефект</h2>
    <p v-if="defect">координаты: {{ defect.x }}, {{ defect.y }}</p>
    <label>
  Зона:
  <input v-model="defect.zone" v-if="defect" />
</label>
<label v-if="defect">
  Тип:
  <select v-model="defect.typeId">
    <option v-for="t in defectTypes" :key="t.id" :value="t.id">
      {{ t.name }}
    </option>
  </select>
</label>
  </div>

</template>