import { io, Socket } from 'socket.io-client'

class SocketClient {
  private static instance: SocketClient
  private socket: Socket | null = null

  private constructor() {}

  public static getInstance(): SocketClient {
    if (!SocketClient.instance) {
      SocketClient.instance = new SocketClient()
    }
    return SocketClient.instance
  }

  public connect(url: string = import.meta.env.VITE_API_URL): Socket {
    if (this.socket?.connected) {
      return this.socket
    }

    this.socket = io(url, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    })

    this.socket.on('connect', () => {})

    this.socket.on('disconnect', () => {})

    return this.socket
  }

  public getSocket(): Socket | null {
    return this.socket
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }
}

export const socketClient = SocketClient.getInstance()
