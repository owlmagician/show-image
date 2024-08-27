import { ElectronAPI } from '@electron-toolkit/preload'

interface API {
  //barcode
  barcodeInit: () => Promise<boolean>
  //slave
  slaveInit: (path: string) => Promise<boolean>
  slaveFist: (path: string) => Promise<boolean>
  slaveDeinit: () => Promise<void>
  // finish
  finishInit: () => Promise<void>
  // callback
  OnListener: (event: string, callback: (data: any) => void) => void
  removeEvent: (event: string, callback: (data: any) => void) => void
}
declare global {
  interface Window {
    electron: ElectronAPI
    api: API
  }
}
