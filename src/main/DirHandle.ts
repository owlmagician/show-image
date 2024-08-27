import { UsbPack } from '@shared/Types'
import { FileHandle } from './FIleHandle'

class DirHandle {
  private static instance: DirHandle
  //variable
  private TARGET: FileHandle | null = null
  // khởi tạo đường dẫn
  private constructor() {
    this.TARGET = new FileHandle('../../../usb') // đường dẫn ra usb
    console.log('DirHandle instance created')

  }
  // tạo đối tượng
  public static getInstance(): DirHandle {
    if (!DirHandle.instance) {
      DirHandle.instance = new DirHandle()
    }
    return DirHandle.instance
  }
  // quét item trong đường dẫn
  public Dir_scan = async (Path: string, mode: boolean): Promise<string[]> => {
    return await this.TARGET.ScanDirectory(Path, mode)
  }
  // đọc file text
  public Dir_readText = async (path: string): Promise<string> => {
    return await this.TARGET.ReadFile(`${path}`)
  }
  // tải phương tiện
  public Dir_loadMedia = async (path: string, media: string): Promise<UsbPack> => {
    return await this.TARGET.LoadMedia(media, path)
  }
  // hàm dọn dẹp
  public cleanup(): void {
    if (this.TARGET) this.TARGET = null
  }
}

export default DirHandle
