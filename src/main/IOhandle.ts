import { BinaryValue, Gpio } from 'onoff'

class GpioManager {
  private static instance: GpioManager
  // GPIO pins
  private OUTPUT: Gpio
  private INPUT: Gpio
  private SPEAKER: Gpio

  private constructor() {
    // Khởi tạo GPIO pins
    this.OUTPUT = new Gpio(538, 'out')
    this.INPUT = new Gpio(528, 'in', 'falling', { debounceTimeout: 10 })
    this.SPEAKER = new Gpio(516, 'out')
  }

  public static getInstance(): GpioManager {
    if (!GpioManager.instance) {
      GpioManager.instance = new GpioManager()
    }
    return GpioManager.instance
  }

  public setOutput(value: BinaryValue): void {
    this.OUTPUT.writeSync(value)
  }
  public setSpeaker(value: BinaryValue): void {
    this.SPEAKER.writeSync(value)
  }

  public watchInput(callback: (err: Error | null, value: number) => void): void {
    this.INPUT.watch(callback);
  }

  public cleanup(): void {
    this.OUTPUT.unexport()
    this.INPUT.unexport()
    this.SPEAKER.unexport()
  }
}

export default GpioManager