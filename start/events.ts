import Event from '@ioc:Adonis/Core/Event'
import Ws from 'App/Services/Ws'
import { Namespace } from 'socket.io'

Event.on('new:message', ({message}) => {
  const namespaces = Ws.parent.children as Set<Namespace>
  for (const namespace of namespaces) {
    if (namespace.name === `/text_channel_${message.channel.id}`) {
      for (const socket of namespace.sockets.values()) {
        socket.emit('new:message', message)
      }
    }
  }
  for (const socket of Ws.io.sockets.sockets.values()) {
    if(socket.$user.id !== message.author.id) {
      socket.emit('new:message', message)
    }
  }
})

Event.on('user:changed', ({ user }) => {
  for (const socket of Ws.io.sockets.sockets.values()) {
    if(socket.$user.id === user.id) {
      socket.emit('user:changed', user)
    }
  }
  const namespaces = Ws.parent.children as Set<Namespace>
  for (const namespace of namespaces) {
    if(namespace.name.includes('/text_channel_')) {
      for (const socket of namespace.sockets.values()) {
        if(socket.$channel.users.findIndex(obj => obj.id === user.id) !== -1) {
          socket.emit('user:changed', user)
        }
      }
    }
  }
})
