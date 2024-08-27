import { UsbPack } from '@shared/Types'
import { BrowserWindow } from 'electron'
import { DelimiterParser, SerialPort } from 'serialport'
import DirHandle from './DirHandle'
import GpioManager from './IOhandle'

class SerialSlave {
  private static instance: SerialSlave
  // variable
  private PORT: SerialPort
  private PARSER: DelimiterParser
  private INTERVAL: NodeJS.Timeout | null = null
  private LISTENER: ((data: Buffer) => void) | null = null
  private ITEM: number = 0
  private LISTITEM: string[] = []
  private MEDIA: UsbPack | null = null
  private SLAVE: string = ''
  // khởi tạo serial
  private constructor() {
    this.PORT = new SerialPort({ path: '/dev/ttyS0', baudRate: 9600 })
    this.PARSER = this.PORT.pipe(new DelimiterParser({ delimiter: '\r\n' }))
    console.log('SerialSlave instance created')
  }
  // tạo đối tượng
  public static getInstance(): SerialSlave {
    if (!SerialSlave.instance) {
      SerialSlave.instance = new SerialSlave()
    }
    return SerialSlave.instance
  }
  public Read_SlaveSerial = async (
    win: BrowserWindow,
    dir: DirHandle,
    io: GpioManager,
    path: string
  ): Promise<boolean> => {
    try {
      // đặt output lên cao
      io.setOutput(1)
      // lấy các item để xử lý
      this.LISTITEM = await this.Load_listItem(dir, path)
      let media: UsbPack | null = null

      console.log('update ListItem')
      if (this.LISTITEM && this.ITEM === 0) {
        media = await dir.Dir_loadMedia(`/${path}/IMAGE`, this.LISTITEM[this.ITEM])
        let NameSlave: string = media.NAME ? 'NEXT' : this.LISTITEM[this.ITEM]
        win.webContents.send('load-media', media)
        // nếu timer chưa được khởi tạo
        if (!this.INTERVAL) {
          this.INTERVAL = setInterval(() => {
            this.PORT.write(`$P${NameSlave}\r\n`)
            console.log(`${NameSlave} num: ${this.ITEM}`)
          }, 1000)
        }
        // nếu listener chưa khởi tạo
        if (!this.LISTENER) {
          this.LISTENER = async (data: Buffer) => {
            // kiểm tra slave
            if (await this.Check_Slaves(io, data.toString(), this.LISTITEM, this.ITEM)) {
              // kiểm tra độ dài
              console.log('Item num', this.ITEM)
              console.log('Item length', this.LISTITEM.length)

              if (this.ITEM < this.LISTITEM.length - 1) {
                media = await dir.Dir_loadMedia(`/${path}/IMAGE`, this.LISTITEM[++this.ITEM])
                NameSlave = media.NAME ? 'NEXT' : this.LISTITEM[this.ITEM]
                win.webContents.send('load-media', media)
              } else {
                this.clean_Interval()
                win.webContents.send('finish-media')
              }
              this.PORT.write('$FF\r\n')
            }
          }
          this.PARSER.on('data', this.LISTENER)
        } else {
          console.log('LISTENER serialSlave has been create')
        }
      }
      return true
    } catch (error) {
      console.error('In function `Read_SlaveSerial`', error)
      return false
    }
  }

  // init data
  public Init_slaveSerial = async (
    win: BrowserWindow,
    dir: DirHandle,
    io: GpioManager,
    path: string
  ): Promise<boolean> => {
    try {
      // đặt output lên cao
      io.setOutput(1)
      // lấy các item để xử lý
      this.LISTITEM = await this.Load_listItem(dir, path)
      console.log('update ListItem')
      // kiểm tra timer
      if (!this.INTERVAL) {
        this.INTERVAL = setInterval(() => {
          if (this.SLAVE) {
            this.PORT.write(`$P${this.SLAVE}\r\n`)
            console.log(`${this.SLAVE} num: ${this.ITEM}`)
          }
        }, 1000)
        console.log('created timer send slave!')
      } else {
        console.error('timer send slave has been create')
      }
      // kiểm tra và tạo tạo listener
      if (!this.LISTENER) {
        this.LISTENER = async (data: Buffer) => {
          // kiểm tra slave
          if (await this.Check_Slaves(io, data.toString(), this.LISTITEM, this.ITEM)) {
            // kiểm tra độ dài
            console.log('Item num', this.ITEM)
            console.log('Item length', this.LISTITEM.length)

            if (this.ITEM < this.LISTITEM.length - 1) {
              this.MEDIA = await dir.Dir_loadMedia(`/${path}/IMAGE`, this.LISTITEM[++this.ITEM])
              this.SLAVE = this.MEDIA.BASE64 ? 'NEXT' : this.LISTITEM[this.ITEM]
              win.webContents.send('load-media', this.MEDIA)
              // giải phóng tài nguyên
              this.MEDIA = null
            } else {
              this.SLAVE = ''
              win.webContents.send('finish-media')
            }
            this.PORT.write('$FF\r\n')
          }
        }
        // cập nhật listener
        this.PARSER.on('data', this.LISTENER)
        console.log('created listener send slave!')
      } else {
        console.error('listener slave has been create')
      }
      return true
    } catch (error) {
      console.error('In function `Init_slaveSerial`', error)
      return false
    }
  }

  public Load_fistSlave = async (
    win: BrowserWindow,
    dir: DirHandle,
    path: string
  ): Promise<boolean> => {
    try {
      // kiểm tra danh sách và bộ đếm
      if (this.LISTITEM && this.ITEM === 0) {
        this.MEDIA = await dir.Dir_loadMedia(`/${path}/IMAGE`, this.LISTITEM[this.ITEM])
        this.SLAVE = this.MEDIA.BASE64 ? 'NEXT' : this.LISTITEM[this.ITEM]
        win.webContents.send('load-media', this.MEDIA)
        // giải phóng tài nguyên
        this.MEDIA = null
        console.log(`send fist item`)
      } else {
        console.log(`is not a fist item:`)
        console.log(`${this.ITEM}`)
        console.log(`${this.LISTITEM[this.ITEM]}`)
      }
      return true
    } catch (error) {
      console.error('error function `Load_fistSlave`:', error)
      return false
    }
  }

  public Deinit_slaveSerial = () => {
    // dừng gửi dữ liệu dến slave
    if (this.INTERVAL) {
      clearInterval(this.INTERVAL)
      this.INTERVAL = null
    }
    //dừng nhận dữ liệu từ slave
    if (this.LISTENER) {
      this.PARSER.off('data', this.LISTENER)
      if (this.LISTENER) this.LISTENER = null
    }
    // làm mới các biến
    if (this.LISTITEM) this.LISTITEM = []
    if (this.MEDIA) this.MEDIA = null
    if (this.SLAVE) this.SLAVE = ''
    if (this.ITEM) this.ITEM = 0
  }

  private Load_listItem = async (dir: DirHandle, path: string): Promise<string[]> => {
    try {
      const Step = await dir.Dir_readText(`/${path}/STEP.txt`)
      const startIndex = Step.indexOf('#')
      const endIndex = Step.indexOf('$')
      if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
        const trimmedText = Step.substring(startIndex + 1, endIndex).trim()
        return trimmedText.split('\r\n')
      } else {
        console.log('Không tìm thấy ký tự "#" hoặc "$" trong chuỗi.')
        return []
      }
    } catch (error) {
      console.error('In function "Load_listItem":', error)
      return []
    }
  }
  private Check_Slaves = async (
    io: GpioManager,
    data: string,
    list: string[],
    item: number
  ): Promise<boolean> => {
    const index = data.indexOf('@')
    if (index !== -1) {
      const cmd = data.substring(index + 2)
      if (cmd === list[item] || cmd === 'NEXT') {
        console.log(cmd)
        if (data[index + 1] === '1') {
          console.log('HOLD')
          io.setSpeaker(1)
          return false
        } else if (data[index + 1] === '3') {
          io.setSpeaker(0)
          console.log('NEXT')
          return true
        }
      }
    }
    return false
  }

  public clean_Interval = () => {
    if (this.INTERVAL) {
      clearInterval(this.INTERVAL)
      this.INTERVAL = null
    }
    if (this.LISTENER) this.LISTENER = null
    if (this.LISTITEM) this.LISTITEM = []
    if (this.ITEM) this.ITEM = 0
  }

  public cleanup = () => {
    // xóa các biến khác
    this.Deinit_slaveSerial()
    // xóa parser
    if (this.PARSER) this.PARSER.removeAllListeners()
    // xóa port
    if (this.PORT) this.PORT.close()
  }
}
export default SerialSlave
