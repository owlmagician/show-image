import GpioManager from './IOhandle'
import { BrowserWindow } from 'electron'

class Finish {
  // biến để lưu trữ đối tượng 'SingleTon', được khởi tạo 1 lần duy nhất
  private static instance: Finish
  private inputListener: ((err: any, value: any) => void) | null = null

  // hàm khởi tạo
  private constructor() {
      console.log('Finish instance created')
  }
  // tạo đối tượng
  public static getInstance(): Finish {
    if (!Finish.instance) {
      Finish.instance = new Finish()
    }
    return Finish.instance
  }

  public Wait_user(win: BrowserWindow, io:GpioManager): void {
    // đặt output thành low
    io.setOutput(0)
    // kiểm tra listener đã được khởi tạo hay chưa
    if (!this.inputListener) {
      this.inputListener = (_, value) => {
        if (value === 0) {
          console.log('Button FINISH');
          win.webContents.send('finish-screen', 'Wait to end')
        }
      }
      io.watchInput(this.inputListener)
    } else {
      console.log('listener was be created before')
    }
  }

  public cleanup(): void {
    if (this.inputListener) this.inputListener = null
  }
}

export default Finish
