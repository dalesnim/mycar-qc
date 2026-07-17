<script setup lang="ts">
import { computed, ref } from 'vue'
import { defects, selectedId, defectTypes, isDraft, saveDefect, changeStatus, removeDefect } from '../store'
import { validateDefect } from '../validation'
import { transitions } from '../fsm'
import type { Status } from '../type'

const defect = computed(() =>
  defects.value.find((d) => d.id === selectedId.value)
)

const errors = computed(() => (defect.value ? validateDefect(defect.value) : []))

const serverErrors = ref<string[]>([])
const savedMessage = ref('')

const nextStatuses = computed(() =>
  defect.value ? transitions[defect.value.status] : []
)

async function save() {
  if (!defect.value || errors.value.length > 0) return
  savedMessage.value = ''
  serverErrors.value = await saveDefect(defect.value)
  if (serverErrors.value.length === 0) savedMessage.value = 'сохранено!'
}

async function setStatus(to: Status) {
  if (!defect.value) return
  serverErrors.value = await changeStatus(defect.value, to)
}

function remove() {
  if (defect.value) removeDefect(defect.value)
}
</script>

<template>
  <div v-if="defect">
    <h2>Дефект</h2>
    <p>координаты: {{ defect.x }}, {{ defect.y }}</p>
    <label>
      Зона:
      <input v-model="defect.zone" @input="savedMessage = ''" />
    </label>
    <label>
      Тип:
      <select v-model="defect.typeId" @change="savedMessage = ''">
        <option v-for="t in defectTypes" :key="t.id" :value="t.id">
          {{ t.name }}
        </option>
      </select>
    </label>
    <label>
      Серьезность:
      <select v-model="defect.severity" @change="savedMessage = ''">
        <option value="low">low</option>
        <option value="high">high</option>
        <option value="critical">critical</option>
      </select>
    </label>
    <label>
      Комментарий:
      <input v-model="defect.comment" @input="savedMessage = ''" />
    </label>

    <p>Статус: {{ defect.status }}</p>
    <div v-if="isDraft(defect)">
      <p>Сохраните дефект чтобы менять статус</p>
    </div>
    <div v-else>
      <button v-for="s in nextStatuses" :key="s" @click="setStatus(s)">
        перевести в {{ s }}
      </button>
      <span v-if="nextStatuses.length === 0">это конечный статус</span>
    </div>

    <button @click="save">Сохранить</button>
    <button @click="remove">Удалить</button>
    <p v-if="savedMessage">{{ savedMessage }}</p>

    <ul v-if="errors.length > 0">
      <li v-for="err in errors" :key="err">{{ err }}</li>
    </ul>
    <ul v-if="serverErrors.length > 0">
      <li v-for="err in serverErrors" :key="err">{{ err }}</li>
    </ul>
  </div>
</template>
