<script setup lang="ts">
import { computed, ref } from 'vue'
import { defects, selectedId, defectTypes, draft, saveDefect, changeStatus, removeDefect, role } from '../store'
import { validateDefect } from '../validation'
import { transitions } from '../fsm'
import type { Status } from '../type'

const defect = computed(() =>
  draft.value || defects.value.find((d) => d.id === selectedId.value)
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

async function remove() {
  if (!defect.value) return
  serverErrors.value = await removeDefect(defect.value)
}
</script>

<template>
  <div v-if="defect" class="card">
    <h2>{{ draft ? 'Новый дефект' : 'Дефект' }}</h2>
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

    <template v-if="!draft">
      <p>Статус: <span class="badge" :class="defect.status">{{ defect.status }}</span></p>
      <div v-if="role === 'master'">
        <button v-for="s in nextStatuses" :key="s" @click="setStatus(s)">
          перевести в {{ s }}
        </button>
        <span v-if="nextStatuses.length === 0">это конечный статус</span>
      </div>
      <p v-else>Статусы ремонта переводит мастер</p>
    </template>

    <template v-if="role === 'inspector'">
      <button @click="save">Сохранить</button>
      <button @click="remove">{{ draft ? 'Отмена' : 'Удалить' }}</button>
    </template>
    <p v-if="savedMessage">{{ savedMessage }}</p>

    <ul v-if="errors.length > 0" class="errors">
      <li v-for="err in errors" :key="err">{{ err }}</li>
    </ul>
    <ul v-if="serverErrors.length > 0" class="errors">
      <li v-for="err in serverErrors" :key="err">{{ err }}</li>
    </ul>
  </div>
</template>

<style scoped>
.card {
  background: white;
  border: 1px solid #ccc;
  padding: 15px;
  margin-bottom: 15px;
}
.card h2 {
  margin-top: 0;
}
label {
  display: block;
  margin-bottom: 8px;
}
.errors {
  color: red;
}
</style>
