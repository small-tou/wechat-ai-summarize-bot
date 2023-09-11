import { ipcRenderer, contextBridge } from 'electron';
 contextBridge.exposeInMainWorld('electronAPI', {
   getDir: (title) => ipcRenderer.send('get-dir', title),
 });