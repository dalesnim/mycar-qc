<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import CarMap from './components/CarMap.vue'
import DefectCard from './components/DefectCard.vue'
import DefectList from './components/DefectList.vue'
import StatusSummary from './components/StatusSummary.vue'
import PdiChecklist from './components/PdiChecklist.vue'
import QualityDashboard from './components/QualityDashboard.vue'
import { loadAll, role, draft, apiError, user, login, logout } from './store'

const loginName = ref('')
const password = ref('')
const loginErrors = ref<string[]>([])
const showDashboard = ref(false)

onMounted(loadAll)

watch(role, () => {
  if (role.value !== 'inspector') draft.value = null
})

async function doLogin() {
  loginErrors.value = await login(loginName.value, password.value)
  if (loginErrors.value.length === 0) {
    loginName.value = ''
    password.value = ''
  }
}
</script>

<template>
<div class="header">
  <h1>MyCar - контроль качества</h1>
  <div v-if="user" class="user-info">
    {{ user.name }} - {{ user.role === 'inspector' ? 'инспектор' : 'мастер' }}
    <button @click="logout">Выйти</button>
  </div>
</div>

<p v-if="apiError" class="api-error">{{ apiError }}</p>

<div v-if="!user" class="login-box">
  <h2>Вход</h2>
  <form @submit.prevent="doLogin">
    <label>
      Логин:
      <input v-model="loginName" />
    </label>
    <label>
      Пароль:
      <input v-model="password" type="password" />
    </label>
    <button type="submit">Войти</button>
  </form>
  <ul v-if="loginErrors.length > 0" class="errors">
    <li v-for="err in loginErrors" :key="err">{{ err }}</li>
  </ul>
</div>


  <div v-else class="layout">
    <CarMap />
    <div class="panel">
      <DefectCard />
      <DefectList/>
      <StatusSummary/>
      <PdiChecklist/>
      <p>
        <a href="http://localhost:3000/inspections/VIN1/pdi-report" target="_blank">Отчёт PDI</a>
        <button class="dash-btn" @click="showDashboard = !showDashboard">
          {{ showDashboard ? 'скрыть дашборд' : 'Дашборд качества' }}
        </button>
      </p>
      <QualityDashboard v-if="showDashboard" />
    </div>
  </div>
</template>

<style>
body {
  font-family: Arial, sans-serif;
  background: #f5f5f5;
  color: #222;
  margin: 0;
  padding: 20px;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #ccc;
  padding-bottom: 10px;
  margin-bottom: 15px;
}
h1 {
  font-size: 22px;
  margin: 0;
}
.user-info button {
  margin-left: 10px;
}
.role-hint {
  color: #555;
}
.login-box {
  background: white;
  border: 1px solid #ccc;
  padding: 20px;
  max-width: 300px;
  margin: 60px auto;
}
.login-box label {
  display: block;
  margin-bottom: 10px;
}
.login-box input {
  width: 100%;
  box-sizing: border-box;
}
.hint {
  color: #888;
  font-size: 13px;
}
.layout {
  display: flex;
  gap: 40px;
  align-items: flex-start;
}
.panel {
  flex: 1;
  max-width: 550px;
}
button {
  margin-right: 5px;
  margin-top: 5px;
  cursor: pointer;
}
select {
  margin-right: 5px;
}
.api-error {
  color: red;
  border: 1px solid red;
  background: white;
  padding: 8px;
}
.errors {
  color: red;
}
.badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  color: white;
}
.badge.new { background: #d9534f; }
.badge.in_repair { background: #f0ad4e; }
.badge.resolved { background: #5cb85c; }
.badge.rejected { background: #999; }
</style>
