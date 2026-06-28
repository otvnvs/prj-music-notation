<template>
  <div v-if="isOpen" class="dialog-overlay" @click.self="$emit('close')">
    <div class="dialog-box">
      <!-- Breadcrumb Nav Header -->
      <div class="dialog-header">
        <div class="header-nav">
          <button v-if="currentDirId !== 'root'" class="back-btn" @click="navigateUp">⬅</button>
          <span class="path-title">{{ currentDirName }}</span>
        </div>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <!-- Action Operations inside Active Layer -->
      <div class="toolbar">
        <button class="tool-btn" @click="handleCreateFile">📄 New File</button>
        <button class="tool-btn" @click="handleCreateDir">📁 New Folder</button>
      </div>
      
      <div class="file-list">
        <!-- Render Nested Folders within current directory level -->
        <div 
          v-for="dir in currentSubDirs" 
          :key="dir.id" 
          class="file-item directory"
          @click="currentDirId = dir.id"
        >
          <span class="file-name">📁 {{ dir.name }}</span>
          <div class="actions">
            <button class="action-btn" @click.stop="triggerRenameDir(dir)">✎</button>
            <button class="action-btn delete" @click.stop="handleDeleteDir(dir.id)">🗑️</button>
          </div>
        </div>

        <!-- Render Target Files within current directory level -->
        <div 
          v-for="file in currentFiles" 
          :key="file.id" 
          :class="['file-item', { active: file.id === activeId }]"
          @click="handleFileClick(file.id)"
        >
          <span class="file-name">📄 {{ file.name }}</span>
          <div class="actions">
            <button class="action-btn" @click.stop="triggerRenameFile(file)">✎</button>
            <button class="action-btn delete" @click.stop="handleDeleteFile(file.id)">🗑️</button>
          </div>
        </div>

        <div v-if="currentSubDirs.length === 0 && currentFiles.length === 0" class="empty-state">
          Empty folder
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { 
  getFiles, getDirectories, getActiveFileId, 
  renameFile, renameDirectory, createDirectory, createNewFile, deleteFile, deleteDirectoryRecursive 
} from '../utils/store.js'
import { ref, computed, onMounted } from 'vue'

defineProps({ isOpen: Boolean })
const emit = defineEmits(['close', 'file-selected'])

const files = ref([])
const directories = ref([])
const activeId = ref('')
const currentDirId = ref('root')

// Dynamic calculations based on state tree position
const currentDirName = computed(() => {
  const dir = directories.value.find(d => d.id === currentDirId.value)
  return dir ? dir.name : 'Storage'
})

const currentSubDirs = computed(() => {
  return directories.value.filter(d => d.parentId === currentDirId.value)
})

const currentFiles = computed(() => {
  return files.value.filter(f => f.parentId === currentDirId.value)
})

const loadData = () => {
  files.value = getFiles()
  directories.value = getDirectories()
  activeId.value = getActiveFileId()
}

const navigateUp = () => {
  const current = directories.value.find(d => d.id === currentDirId.value)
  if (current && current.parentId) {
    currentDirId.value = current.parentId
  }
}

const handleFileClick = (id) => {
  emit('file-selected', id)
  emit('close')
}

const handleCreateFile = () => {
  const name = prompt('Enter filename:', 'notes.txt')
  if (name && name.trim()) {
    const newId = createNewFile(name.trim(), currentDirId.value)
    loadData()
    handleFileClick(newId)
  }
}

const handleCreateDir = () => {
  const name = prompt('Enter folder name:')
  if (name && name.trim()) {
    createDirectory(name.trim(), currentDirId.value)
    loadData()
  }
}

const handleDeleteFile = (id) => {
  if (confirm('Delete this file permanently?')) {
    deleteFile(id)
    loadData()
  }
}

const handleDeleteDir = (id) => {
  if (confirm('Delete this folder and ALL contained subfolders and files?')) {
    deleteDirectoryRecursive(id)
    loadData()
  }
}

const triggerRenameFile = (file) => {
  const newName = prompt('Rename file:', file.name )
  if (newName && newName.trim()) {
    renameFile(file.id, newName.trim())
    loadData()
  }
}

const triggerRenameDir = (dir) => {
  const newName = prompt('Rename folder:', dir.name)
  if (newName && newName.trim()) {
    renameDirectory(dir.id, newName.trim())
    loadData()
  }
}

onMounted(loadData)
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
}
.dialog-box {
  background-color: #1e1e1e;
  border-radius: 8px;
  width: 100%;
  max-width: 400px;
  max-height: 75vh;
  display: flex;
  flex-direction: column;
  border: 1px solid #333;
}
.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #333;
}
.header-nav {
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 80%;
}
.back-btn {
  background: none;
  border: none;
  color: #e0e0e0;
  font-size: 18px;
  cursor: pointer;
}
.path-title {
  color: #e0e0e0;
  font-weight: bold;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.close-btn { background: none; border: none; color: #888; font-size: 18px; }
.toolbar {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid #252525;
}
.tool-btn {
  flex: 1;
  background: #2d2d2d;
  border: 1px solid #444;
  color: #e0e0e0;
  padding: 8px;
  border-radius: 4px;
  font-size: 14px;
}
.file-list { overflow-y: auto; padding: 8px 0; }
.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  cursor: pointer;
  border-bottom: 1px solid #252525;
}
.file-item.directory { background-color: #1a2430; }
.file-item.active { background-color: #2d2d2d; border-left: 4px solid #007acc; }
.file-name { color: #e0e0e0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; margin-right: 8px; }
.actions { display: flex; gap: 4px; }
.action-btn { background: none; border: none; color: #888; padding: 4px 8px; font-size: 16px; cursor: pointer; }
.action-btn.delete { color: #cc3333; }
.empty-state { padding: 32px; text-align: center; color: #666; font-style: italic; }
</style>

