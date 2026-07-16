

<script setup lang = "ts">
import {defects} from '../store'
function onMapClick(e: MouseEvent){
     defects.value.push({
    id: crypto.randomUUID(),
    vin: 'VIN1',
    x: e.offsetX,
    y: e.offsetY,
    zone: '',
    typeId: '',
    severity: 'low',
    status: 'new',
    comment: '',
  })
  console.log(defects.value.length)
}
</script>

<template>
  <svg viewBox="0 0 300 600" class="car" @click="onMapClick">
    
    <rect x="40" y="20" width="220" height="560" rx="70"
          fill="#e8e8e8" stroke="#333" stroke-width="3" />
    
    <line x1="55" y1="150" x2="245" y2="150" stroke="#333" stroke-width="2" />
    
    <path d="M 70 160 L 230 160 L 210 230 L 90 230 Z"
          fill="#bcd6e4" stroke="#333" stroke-width="2" />
   
    <rect x="85" y="235"
    fill="#dcdcdc" stroke="#333" stroke-width="2" />
   
    <path d="M 90 400 L 210 400 L 230 460 L 70 460 Z"
          fill="#bcd6e4" stroke="#333" stroke-width="2" />
    
    <line x1="55" y1="470" x2="245" y2="470" stroke="#333" stroke-width="2" />
    
    <rect x="20" y="165" width="20" height="30" rx="6"
          fill="#e8e8e8" stroke="#333" stroke-width="2" />
    <rect x="260" y="165" width="20" height="30" rx="6"
          fill="#e8e8e8" stroke="#333" stroke-width="2" />

      <circle v-for="d in defects" :key="d.id" :cx="d.x" :cy="d.y" r="8" fill="red" />
  </svg>
</template>

<style scoped>
.car {
  width: 300px;
  display: block;
}
</style>