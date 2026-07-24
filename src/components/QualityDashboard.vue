<script setup lang="ts">
import { ref } from 'vue'

interface Analytics {
  byType: { typeId: string; name: string; count: number }[]
  byZone: { zone: string; count: number }[]
  topZones: { zone: string; count: number }[]
  passRate: number | null
}

const data = ref<Analytics | null>(null)
const error = ref('')

async function load() {
  try {
    const res = await fetch('http://localhost:3000/analytics/quality')
    data.value = await res.json()
    error.value = ''
  } catch {
    error.value = 'Не получилось загрузить аналитику'
  }
}

load()
</script>

<template>
  <div class="dashboard">
    <h2>Дашборд качества</h2>
    <p v-if="error" class="errors">{{ error }}</p>
    <template v-if="data">
      <p>
        Доля годных кузовов:
        <b>{{ data.passRate === null ? 'нет данных' : Math.round(data.passRate * 100) + '%' }}</b>
      </p>
      <div class="tables">
        <div>
          <h3>По типам</h3>
          <table>
            <tr v-for="t in data.byType" :key="t.typeId">
              <td>{{ t.name }}</td>
              <td>{{ t.count }}</td>
            </tr>
            <tr v-if="data.byType.length === 0"><td>дефектов нет</td></tr>
          </table>
        </div>
        <div>
          <h3>По зонам</h3>
          <table>
            <tr v-for="z in data.byZone" :key="z.zone">
              <td>{{ z.zone }}</td>
              <td>{{ z.count }}</td>
            </tr>
            <tr v-if="data.byZone.length === 0"><td>дефектов нет</td></tr>
          </table>
        </div>
        <div>
          <h3>Топ проблемных зон</h3>
          <ol>
            <li v-for="z in data.topZones" :key="z.zone">{{ z.zone }} ({{ z.count }})</li>
          </ol>
          <p v-if="data.topZones.length === 0">пока пусто</p>
        </div>
      </div>
      <button @click="load">Обновить</button>
    </template>
  </div>
</template>

<style scoped>
.dashboard {
  background: white;
  border: 1px solid #ccc;
  padding: 15px;
  margin-top: 15px;
}
.dashboard h2 {
  margin-top: 0;
}
.tables {
  display: flex;
  gap: 40px;
}
td {
  padding: 2px 10px 2px 0;
}
.errors {
  color: red;
}
</style>
