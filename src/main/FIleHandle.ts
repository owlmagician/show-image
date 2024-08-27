import { UsbPack } from '@shared/Types'
import fs from 'fs'
import path from 'path'
import { promisify } from 'util'

export class FileHandle {
  path: string
  constructor(filePath: string) {
    this.path = path.resolve(__dirname, filePath)
  }

  ScanDirectory = async (Dir: string, mode: boolean): Promise<string[]> => {
    const readdir = promisify(fs.readdir)
    try {
      const files = await readdir(this.path + Dir, { withFileTypes: true })
      let Items: fs.Dirent[]
      // false = Directory | true = file
      if (!mode)
        Items = files.filter((file) => file.isDirectory()) // scan directory
      else Items = files.filter((file) => file.isFile()) // scan file

      const ItemNames = Items.map((item) => item.name)
      console.log('Return function "ScanDirectory": ', ItemNames)
      return ItemNames
    } catch (err) {
      // console.error('In function "ScanDirectory": ', err)
      return []
    }
  }

  CreateDirectory = async (directoryName: string): Promise<boolean> => {
    let FlagOK: boolean = false

    fs.mkdir(this.path + directoryName, { recursive: true }, (err) => {
      if (err) console.error('In function "CreateDirectory": ', err)
      else FlagOK = true
    })
    // console.log('Return function "CreateDirectory": ', FlagOK)
    return FlagOK
  }

  CreateFile = async (fileName: string): Promise<boolean> => {
    let FlagOK: boolean = false

    fs.writeFile(this.path + fileName, '', (err) => {
      if (err) console.error('In function "CreateFile": ', err)
      else FlagOK = true
    })
    // console.log('Return function "CreateFile": ', FlagOK)
    return FlagOK
  }

  WriteFile = async (fileName: string, content: string): Promise<boolean> => {
    let FlagOK: boolean = false
    const path = this.path + fileName
    console.log(path)
    fs.appendFile(path, content, (err) => {
      if (err) console.error('In function "WriteFile": ', err)
      else FlagOK = true
    })
    // console.log('Return function "WriteFile": ', FlagOK)
    return FlagOK
  }

  ReadFile = async (fileName: string): Promise<string> => {
    let output: string = ''
    const readFileAsync = promisify(fs.readFile)
    try {
      output = await readFileAsync(this.path + fileName, 'utf-8')
      // console.log('Successfully read file:', this.path + fileName)
    } catch (error) {
      // console.error('Error reading the file:', error)
      // Optionally handle or rethrow the error here
    }
    // console.log('Return function "WriteFile": ', output)
    return output
  }

  LoadMedia = async (MediaName: string, filePATH: string): Promise<UsbPack> => {
    let targetName: string = MediaName
    let targetType: string = ''
    let targetBase64: string = ''

    const fileExtensions = ['.jpg', '.jpeg', '.png', '.mp4', '.avi', '.mov']
    // console.log(`Find File: ${this.path + '/' + filePATH + '/' + MediaName}`)

    for (const ext of fileExtensions) {
      var targetPath = path.resolve(__dirname, this.path + '/' + filePATH + '/' + MediaName + ext)
      if (fs.existsSync(targetPath)) {
        console.log(`File found: ${targetPath}`)
        const fileExtension = path.extname(targetPath).toLowerCase().slice(1)
        targetType = fileExtension
        // if (['.jpg', '.jpeg', '.png'].includes(fileExtension)) targetType = 'image'
        // else if (['.mp4', '.avi', '.mov'].includes(fileExtension)) targetType = 'video'

        targetBase64 = fs.readFileSync(targetPath).toString('base64')

        break
      }
    }
    // console.log(`NAME: ${targetName}\r\n URL: ${targetURL}\r\n TYPE: ${targetType}\r\n`)
    return { NAME: targetName, TYPE: targetType, BASE64: targetBase64 }
  }
}
