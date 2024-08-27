import { UsbPack } from '@shared/Types'
import * as fs from 'fs'
import * as path from 'path'
import { promisify } from 'util'

const pipeline = promisify(require('stream').pipeline)

class FScontrol {
  private static instance: FScontrol
  private PATH: string
  private constructor() {
    this.PATH = path.resolve(__dirname, '../../../usb')
    console.log(`FScontrol has been created`)
  }
  // tạo đối tượng
  public static getInstance(): FScontrol {
    if (!FScontrol.instance) {
      FScontrol.instance = new FScontrol()
    }
    return FScontrol.instance
  }
  // hàm quét thư mục
  public FScontrol_scanDir = async (dir: string) => {
    try {
        fs.ReadStream
    } catch (error) {
        
    }
  }

  // hàm tải dữ liệu hình ảnh
  public FScontrol_loadMedia = async (
    MediaName: string,
    filePATH: string
  ): Promise<UsbPack | null> => {
    try {
      let targetName: string = MediaName
      let targetType: string = ''
      let targetBase64: string = ''

      const fileExtensions = ['.jpg', '.jpeg', '.png', '.mp4', '.avi', '.mov']

      for (const ext of fileExtensions) {
        const targetPath = path.resolve(
          __dirname,
          this.PATH + '/' + filePATH + '/' + MediaName + ext
        )
        if (fs.existsSync(targetPath)) {
          console.log(`File found: ${targetPath}`)
          const fileExtension = path.extname(targetPath).toLowerCase().slice(1)
          targetType = fileExtension

          // Sử dụng stream để đọc file và chuyển đổi thành Base64
          const readStream = fs.createReadStream(targetPath)
          const chunks: Buffer[] = []
          readStream.on('data', (chunk: Buffer) => chunks.push(chunk))
          readStream.on('end', () => {
            const buffer = Buffer.concat(chunks)
            targetBase64 = buffer.toString('base64')
            // Giải phóng bộ nhớ sau khi dữ liệu đã được đọc xong
            chunks.length = 0 // Xóa các chunk khỏi bộ nhớ
          })
          readStream.on('error', (err) => {
            console.error('Error reading file:', err)
          })
          // Đợi cho đến khi dữ liệu được đọc xong
          await new Promise((resolve, reject) => {
            readStream.on('end', resolve)
            readStream.on('error', reject)
          })

          break
        }
      }
      return { NAME: targetName, TYPE: targetType, BASE64: targetBase64 }
    } catch (error) {
      console.error(`error function FScontrol_loadMedia:`, error)
      return null
    }
  }
}
