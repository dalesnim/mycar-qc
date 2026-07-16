<script setup lang="ts">
import {defects,selectedId} from "../store"
import {computed} from 'vue'
import { defectTypes } from '../data'
import { validateDefect } from '../validation'
import { transitions, canTransition } from '../fsm'
import type { Status } from '../type'

const defect = computed(() =>
  defects.value.find(d => d.id === selectedId.value)
)

const errors = computed(() => defect.value ? validateDefect(defect.value) : [])

// список статусов куда можно перейти из текущего
const nextStatuses = computed(() =>
  defect.value ? transitions[defect.value.status] : []
)

function changeStatus(to: Status) {
  if (defect.value && canTransition(defect.value.status, to)) {
    defect.value.status = to
  }
}

function removeDefect() {
  defects.value = defects.value.filter(d => d.id !== selectedId.value)
  selectedId.value = null
}
</script>

<template>
  <div v-if="defect">
    <h2>Дефект</h2>
    <p>координаты: {{ defect.x }}, {{ defect.y }}</p>
    <label>
      Зона:
      <input v-model="defect.zone" />
    </label>
    <label>
      Тип:
      <select v-model="defect.typeId">
        <option v-for="t in defectTypes" :key="t.id" :value="t.id">
          {{ t.name }}
        </option>
      </select>
    </label>
    <label>
      Серьезность:
      <select v-model="defect.severity">
        <option value="low">low</option>
        <option value="high">high</option>
        <option value="critical">critical</option>
      </select>
    </label>
    <label>
      Комментарий:
      <input v-model="defect.comment" />
    </label>

    <p>Статус: {{ defect.status }}</p>
    <div>
      <button v-for="s in nextStatuses" :key="s" @click="changeStatus(s)">
        перевести в {{ s }}
      </button>
      <span v-if="nextStatuses.length === 0">это конечный статус</span>
    </div>

    <button @click="removeDefect">Удалить</button>
    <ul v-if="errors.length > 0">
      <li v-for="err in errors" :key="err">{{ err }}</li>
    </ul>
  </div>
</template>