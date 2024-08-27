import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  //barcode
  barcodeInit: () => ipcRenderer.invoke('barcode-init'),
  //slave
  slaveInit: (path: string) => ipcRenderer.invoke('slave-init', path),
  slaveFist: (path: string) => ipcRenderer.invoke('slave-fist', path),
  slaveDeinit: () => ipcRenderer.invoke('slave-deinit'),
  // finish
  finishInit: () => ipcRenderer.invoke('finish-init'),
  // callback
  OnListener:(event: string, callback: (data: any) => void) => { ipcRenderer.on(event, (_, data:any) => callback(data));},
  removeEvent: (event: string, callback: (data: any) => void) => { ipcRenderer.removeListener(event, callback);}
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
