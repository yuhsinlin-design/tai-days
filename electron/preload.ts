import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  readCalendarData: () => ipcRenderer.invoke('read-calendar-data'),
  readAudio: (file: string) => ipcRenderer.invoke('read-audio', file),
  setDockIcon: (dataUrl: string) => ipcRenderer.invoke('set-dock-icon', dataUrl),
})
