<script setup lang="ts">
import {defects,selectedId} from "../store"
import {computed} from 'vue'
import { defectTypes } from '../data'
import { validateDefect } from '../validation'

const defect = computed(() =>
  defects.value.find(d => d.id === selectedId.value)
)

const errors = computed(() => defect.value ? validateDefect(defect.value) : [])

function removeDefect() {
  defects.value = defects.value.filter(d => d.id !== selectedId.value)
  selectedId.value = null
}
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
<label v-if="defect">
  Серьезность:
  <select v-model="defect.severity">
    <option value="low">low</option>
    <option value="high">high</option>
    <option value="critical">critical</option>
  </select>
</label>

<label>
  Комментарий:
  <input v-model="defect.comment" v-if="defect" />
</label>

<button v-if="defect" @click="removeDefect">Удалить</button>
<ul v-if="errors.length > 0">
  <li v-for="err in errors" :key="err">{{ err }}</li>
</ul>
  </div>
</template>