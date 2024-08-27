import { DelimiterParser, SerialPort } from 'serialport'
import DirHandle from './DirHandle'
import { BrowserWindow } from 'electron'
import GpioManager from './IOhandle'

class SerialBarcode {
  private static instance: SerialBarcode
  // variable
  private PORT: SerialPort
  private PARSER: DelimiterParser
  private LISTENER: ((data: Buffer) => void) | null = null

  // khởi tạo serial
  private constructor() {
    this.PORT = new SerialPort({ path: '/dev/ttyUSB0', baudRate: 9600 })
    this.PARSER = this.PORT.pipe(new DelimiterParser({ delimiter: '\r\n' }))
    console.log('SerialBarcode instance created')

  }
  // tạo đối tượng
  public static getInstance(): SerialBarcode {
    if (!SerialBarcode.instance) {
      SerialBarcode.instance = new SerialBarcode()
    }
    return SerialBarcode.instance
  }
  // đọc dữ liệu bằng listener
  public Read_SerialBarcode = async (
    win: BrowserWindow,
    dir: DirHandle,
    io: GpioManager
  ): Promise<boolean> => {

    try {
    // đặt chân io về low
    io.setOutput(0)
    //  kiểm tra xem listener đã được khởi tạo chưa
    if (!this.LISTENER) {

      // callback nhận data từ serial
      this.LISTENER = async (data: Buffer) => {
        const input = data.toString().trim()
        console.log(input)
        const items = await dir.Dir_scan('', false)
        const isFound = items.includes(input)
        // listener nhận dữ liệu
        win.webContents.send('return-barcode', {
          NAME: input,
          RESULT: isFound,
          NOTIFICATION: isFound
            ? `Đã tìm thấy ${input}, đang tải dữ liệu`
            : `Không tìm thấy dữ liệu của ${input}, vui lòng thử lại!`
        })
      }
      this.PARSER.on('data', this.LISTENER)
    } else {
      console.log('SerialBarcode Listener was be created')
    }    
    return true
    } catch (error) {
      console.error('In function `Read_SerialBarcode`',error)
      return false
    }
    
  }
  public cleanup = () => {
    if (this.LISTENER) this.LISTENER = null
    if (this.PARSER) this.PARSER.removeAllListeners()
        if (this.PORT) this.PORT.close()
  }
}

export default SerialBarcode
