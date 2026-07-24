<script setup lang="ts">
import { ref } from 'vue'
import { checklist, saveChecklist, role } from '../store'

const errors = ref<string[]>([])
const savedMessage = ref('')

async function save() {
  savedMessage.value = ''
  errors.value = await saveChecklist()
  if (errors.value.length === 0) savedMessage.value = 'чек-лист сохранён!'
}
</script>

<template>
  <div class="checklist">
    <h2>Чек-лист PDI</h2>
    <table>
      <tr v-for="item in checklist" :key="item.key">
        <td>{{ item.label }}</td>
        <td>
          <select v-model="item.result" :disabled="role !== 'inspector'" @change="savedMessage = ''">
            <option value="">не заполнено</option>
            <option value="pass">пройдено</option>
            <option value="fail">не пройдено</option>
            <option value="na">не применимо</option>
          </select>
        </td>
        <td>
          <input v-model="item.comment" :disabled="role !== 'inspector'" placeholder="комментарий" @input="savedMessage = ''" />
        </td>
      </tr>
    </table>
    <button v-if="role === 'inspector'" @click="save">Сохранить чек-лист</button>
    <span v-if="savedMessage" class="saved">{{ savedMessage }}</span>
    <ul v-if="errors.length > 0" class="errors">
      <li v-for="err in errors" :key="err">{{ err }}</li>
    </ul>
  </div>
</template>

<style scoped>
.checklist td {
  padding: 3px 8px 3px 0;
}
.saved {
  color: green;
  margin-left: 8px;
}
.errors {
  color: red;
}
</style>
