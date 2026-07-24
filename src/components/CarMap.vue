<script setup lang="ts">
import { defects, selectedId, role, draft, startDraft } from '../store'
import type { Defect } from '../type'

const statusColors: Record<string, string> = {
  new: '#d9534f',
  in_repair: '#f0ad4e',
  resolved: '#5cb85c',
  rejected: '#999',
}

function markerColor(d: Defect) {
  return statusColors[d.status] || 'red'
}

function onMapClick(e: MouseEvent) {
  if (role.value !== 'inspector') return
  if (e.target === e.currentTarget) return
  startDraft(e.offsetX, e.offsetY)
}
</script>

<template>
  <div class="map-box">
    <svg viewBox="0 0 300 600" class="car" :class="{ clickable: role === 'inspector' }" @click="onMapClick">

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

      <circle v-for="d in defects" :key="d.id" :cx="d.x" :cy="d.y"
        :r="d.id === selectedId ? 10 : 7"
        :fill="markerColor(d)"
        :stroke="d.id === selectedId ? '#222' : 'white'"
        stroke-width="2"
        class="marker"
        @click.stop="selectedId = d.id" />
      <circle v-if="draft" :cx="draft.x" :cy="draft.y" r="8"
        fill="#f0ad4e" stroke="#333" stroke-dasharray="3" />
    </svg>

    <p v-if="role === 'inspector'" class="map-hint">кликни по кузову чтобы отметить дефект</p>
    <p v-else class="map-hint">кликни по метке чтобы открыть дефект</p>

    <div class="legend">
      <span><i style="background: #d9534f"></i> новый</span>
      <span><i style="background: #f0ad4e"></i> в ремонте</span>
      <span><i style="background: #5cb85c"></i> устранён</span>
      <span><i style="background: #999"></i> отклонён</span>
    </div>
  </div>
</template>

<style scoped>
.map-box {
  background: white;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 15px;
}
.car {
  width: 300px;
  max-width: 100%;
  display: block;
}
.car.clickable {
  cursor: crosshair;
}
.marker {
  cursor: pointer;
}
.map-hint {
  color: #888;
  font-size: 13px;
  margin: 10px 0 5px;
}
.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 13px;
  color: #555;
}
.legend i {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 3px;
}
</style>
