<script setup lang="ts">
import { defects, selectedId, role, draft, startDraft } from '../store'
import type { Status } from '../type'

const statusColors: Record<Status, string> = {
  new: '#d9534f',
  in_repair: '#f0ad4e',
  resolved: '#5cb85c',
  rejected: '#999999',
}

function onMapClick(e: MouseEvent) {
  if (role.value !== 'inspector') return
  if (e.target === e.currentTarget) return
  startDraft(e.offsetX, e.offsetY)
}
</script>

<template>
  <div>
    <svg viewBox="0 0 300 600" class="car" @click="onMapClick">

      <rect x="40" y="20" width="220" height="560" rx="70"
            fill="#e8e8e8" stroke="#333" stroke-width="3" />

      <line x1="55" y1="150" x2="245" y2="150" stroke="#333" stroke-width="2" />

      <path d="M 70 160 L 230 160 L 210 230 L 90 230 Z"
            fill="#bcd6e4" stroke="#333" stroke-width="2" />

      <rect x="85" y="235" width="130" height="160"
            fill="#dcdcdc" stroke="#333" stroke-width="2" />

      <path d="M 90 400 L 210 400 L 230 460 L 70 460 Z"
            fill="#bcd6e4" stroke="#333" stroke-width="2" />

      <line x1="55" y1="470" x2="245" y2="470" stroke="#333" stroke-width="2" />

      <rect x="20" y="165" width="20" height="30" rx="6"
            fill="#e8e8e8" stroke="#333" stroke-width="2" />
      <rect x="260" y="165" width="20" height="30" rx="6"
            fill="#e8e8e8" stroke="#333" stroke-width="2" />

      <circle v-for="d in defects" :key="d.id" :cx="d.x" :cy="d.y" r="8"
        @click.stop="selectedId = d.id"
        :fill="statusColors[d.status]"
        :stroke="d.id === selectedId ? '#0066cc' : '#333'"
        :stroke-width="d.id === selectedId ? 3 : 1" />
      <circle v-if="draft" :cx="draft.x" :cy="draft.y" r="8"
        fill="#f0ad4e" stroke="#333" stroke-dasharray="3" />
    </svg>

    <div class="legend">
      <span v-for="(color, s) in statusColors" :key="s">
        <span class="dot" :style="{ background: color }"></span>{{ s }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.car {
  width: 300px;
  display: block;
  background: white;
  border: 1px solid #ccc;
}
.legend {
  margin-top: 8px;
  font-size: 13px;
  display: flex;
  gap: 12px;
}
.dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 4px;
}
</style>
