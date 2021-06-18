import { Server } from 'socket.io'
import AdonisServer from '@ioc:Adonis/Core/Server'

class Ws {
  public io: Server
  public parent: any
  private booted = false
  public port = 3333

  public boot () {
    if (this.booted) {
      return
    }

    this.booted = true
    this.io = new Server(AdonisServer.instance!, {
      cors: {
        origin: '*',
      },
    })
  }
}

export default new Ws()
