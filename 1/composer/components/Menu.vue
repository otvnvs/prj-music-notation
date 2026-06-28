<template>
  <div :class="['sidebar', { open: isOpen }]">
    <div class="menu-header">
      <h3>Menu</h3>
    </div>
    <ul class="menu-list">
      <li class="menu-item" @click="dialogOpen = true">Open</li>
    </ul>
  </div>
  
  <div v-if="isOpen" class="overlay" @click="$emit('close')"></div>

  <FileDialog 
    v-if="dialogOpen" 
    :is-open="dialogOpen" 
    @close="dialogOpen = false"
    @file-selected="(id) => $emit('file-selected', id)"
  />
</template>

<script setup>
import { ref } from 'vue'
import FileDialog from './FileDialog.vue'

defineProps({ isOpen: { type: Boolean, required: true } })
const emit = defineEmits(['close', 'file-selected'])
const dialogOpen = ref(false)
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: -280px;
  width: 280px;
  height: 100vh;
  background-color: #1e1e1e;
  color: #e0e0e0;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.5);
  transition: transform 0.3s ease;
  z-index: 100;
  display: flex;
  flex-direction: column;
}
.sidebar.open { transform: translateX(280px); }
.menu-header { padding: 16px; border-bottom: 1px solid #333; }
.menu-header h3 { margin: 0; }
.menu-list { list-style: none; padding: 0; margin: 0; }
.menu-item { padding: 16px; border-bottom: 1px solid #252525; cursor: pointer; }
.menu-item:active { background-color: #2a2a2a; }
.overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-color: rgba(0, 0, 0, 0.5); z-index: 99; }
</style>
