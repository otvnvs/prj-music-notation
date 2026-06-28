const FILES_KEY = 'vfs_recursive_files'
const DIRS_KEY = 'vfs_recursive_directories'
const ACTIVE_FILE_ID_KEY = 'vfs_active_file_id'

const generateId = () => Math.random().toString(36).substring(2, 9)

const defaultDirs = [
  { id: 'root', name: 'Root Storage', parentId: null }
]

const defaultFiles = [
  { id: '1', name: 'Welcome.txt', content: 'Welcome to your recursive text editor!', parentId: 'root' }
]

export function getDirectories() {
  try {
    const dirs = localStorage.getItem(DIRS_KEY)
    return dirs ? JSON.parse(dirs) : defaultDirs
  } catch {
    return defaultDirs
  }
}

export function saveDirectories(dirs) {
  localStorage.setItem(DIRS_KEY, JSON.stringify(dirs))
}

export function getFiles() {
  try {
    const files = localStorage.getItem(FILES_KEY)
    return files ? JSON.parse(files) : defaultFiles
  } catch {
    return defaultFiles
  }
}

export function saveFiles(files) {
  localStorage.setItem(FILES_KEY, JSON.stringify(files))
}

export function getActiveFileId() {
  return localStorage.getItem(ACTIVE_FILE_ID_KEY) || '1'
}

export function setActiveFileId(id) {
  localStorage.setItem(ACTIVE_FILE_ID_KEY, id)
}

export function createDirectory(name, parentId = 'root') {
  const dirs = getDirectories()
  const newDir = { id: generateId(), name, parentId }
  dirs.push(newDir)
  saveDirectories(dirs)
  return newDir.id
}

export function createNewFile(name = 'Untitled.txt', parentId = 'root') {
  const files = getFiles()
  const newFile = { id: generateId(), name, content: '', parentId }
  files.push(newFile)
  saveFiles(files)
  return newFile.id
}

export function updateFileContent(id, content) {
  const files = getFiles()
  const file = files.find(f => f.id === id)
  if (file) {
    file.content = content
    saveFiles(files)
  }
}

export function renameFile(id, newName) {
  const files = getFiles()
  const file = files.find(f => f.id === id)
  if (file) {
    file.name = newName
    saveFiles(files)
  }
}

export function renameDirectory(id, newName) {
  const dirs = getDirectories()
  const dir = dirs.find(d => d.id === id)
  if (dir) {
    dir.name = newName
    saveDirectories(dirs)
  }
}

export function deleteFile(id) {
  let files = getFiles()
  files = files.filter(f => f.id !== id)
  saveFiles(files)
}

export function deleteDirectoryRecursive(dirId) {
  let dirs = getDirectories()
  let files = getFiles()
  
  const idsToDelete = [dirId]
  
  const findChildren = (parentId) => {
    dirs.forEach(d => {
      if (d.parentId === parentId) {
        idsToDelete.push(d.id)
        findChildren(d.id)
      }
    })
  }
  findChildren(dirId)
  
  dirs = dirs.filter(d => !idsToDelete.includes(d.id))
  files = files.filter(f => !idsToDelete.includes(f.parentId))
  
  saveDirectories(dirs)
  saveFiles(files)
}

