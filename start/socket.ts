import Ws from 'App/Services/Ws'
import { Socket } from 'socket.io'
import { appKey } from 'Config/app'
//import Event from '@ioc:Adonis/Core/Event'
import User from 'App/Models/User'
import TextChannel from 'App/Models/TextChannel'
import Message from 'App/Models/Message'
import axios, { AxiosInstance } from 'axios'
import { DateTime } from 'luxon'
import { string } from '@ioc:Adonis/Core/Helpers'

interface SearchChannelResponse {
  user?: User,
  channel?: TextChannel
}

declare module 'socket.io' {
  interface Socket {
    $axios: AxiosInstance
    $netChan: AxiosInstance
    $user: User
    $channel: TextChannel
    $channel_id: number
  }
}

Ws.boot()

const baseURL = `http://127.0.0.1:${Ws.port}`
const io = Ws.io

const authMiddleware = async (socket, next) => {
  socket.$axios = axios.create({
    baseURL: `${baseURL}/api/`,
    headers: {
      'AdonisHostKey' : appKey,
      'Authorization' : socket.handshake.headers.authorization,
    },
  })
  try {
    const { data } = await socket.$axios.get('user/local')
    socket.$user = await User.findByOrFail('id', data.uid)
  } catch (error) {
    return next(new Error(error))
  }
  next()
}

io.use(authMiddleware)

io.on('connection', async (socket: Socket) => {
  await socket.$user.refresh()
  socket.$user.online = true
  await socket.$user.save()
  socket.on('disconnect', async () => {
    const arrClients = Array.from(io.sockets.sockets.values()).filter((sock: Socket) => {
      return sock.$user.id === socket.$user.id
    })
    if(arrClients.length === 0) {
      await socket.$user.refresh()
      socket.$user.online = false
      socket.$user.seenAt = DateTime.now().toLocal()
      await socket.$user.save()
    }
  })
  socket.emit('message', {
    date: DateTime.now(),
    key: string.generateRandom(32),
  })

  const getChannels = async (user: User, lastMessageAt?: string) => {
    await user.refresh()
    return await user.related('textChannels')
      .query()
      .apply(scopes => scopes.preloadChannel(lastMessageAt))
  }

  socket.emit('queryChannels', await getChannels(socket.$user))
  socket.on('load:channel:first', async (channelId) => {
    const channel = await TextChannel
      .query().where('id', channelId)
      .preload('messages', (messagesQuery) => {
        messagesQuery
          .groupLimit(20)
          .groupOrderBy('id', 'desc')
          .preload('author')
          .preload('forwards')
          .preload('assets')
      })
      .preload('users')
      .first()
    if(channel) {
      socket.emit('load:channel:first', channel)
    }
  })
  socket.on('load:channels', async (lastMessageAt: string) => {
    socket.emit('queryChannels', await getChannels(socket.$user, lastMessageAt))
  })
  socket.on('query:search', async (searchString: string) => {
    if(searchString.length > 4) {
      const results = [] as Array<SearchChannelResponse>
      await socket.$user.refresh()
      if(searchString[0] === '@') {
        const username = searchString.slice(1)
        const users = await User
          .query()
          .where('username', 'like', `%${username}%`)
          .where('id', '!=', socket.$user.id)
        for (const user of users) {
          const channels = await user
            .related('textChannels')
            .query()
            .where('type', 2)
            .whereHas('users', usersQuery => {
              usersQuery.where('id', socket.$user.id)
            })
            .preload('users')
            .preload('messages', (messagesQuery) => {
              messagesQuery
                .groupLimit(20)
                .groupOrderBy('id', 'desc')
                .preload('author')
                .preload('forwards')
                .preload('assets')
            })
          if(channels.length) {
            for (const channel of channels) {
              results.push({
                channel: channel,
              })
            }
          } else {
            results.push({
              user: user,
            })
          }
        }
        socket.emit('query:search', results)
      } else {
        const channels = await socket.$user
          .related('textChannels')
          .query()
          .whereHas('messages', messageQuery => {
            messageQuery.where('message', 'like', `%${searchString}%`)
          })
          .preload('messages', (messagesQuery) => {
            messagesQuery
              .groupLimit(20)
              .groupOrderBy('id', 'desc')
              .preload('author')
              .preload('forwards')
              .preload('assets')
          })
          .preload('users')
        for (const channel of channels) {
          results.push({
            channel: channel,
          })
        }
        socket.emit('query:search', results)
      }
    } else {
      socket.emit('query:search', [])
    }
  })
})

const parent = Ws.parent = io.of((name, __unusedAuth, next) => {
  next(null, /^[/]+text_channel_+[0-9]+[0-9]*$/.exec(name) !== null)
})
parent.use(authMiddleware)
parent.use(async (socket: Socket, next) => {
  socket.$channel_id = parseInt(socket.nsp.name.substring(14))
  socket.$netChan = axios.create({
    baseURL: `${baseURL}/api/channel/${socket.nsp.name}`,
    headers: {
      'AdonisHostKey' : appKey,
      'Authorization' : socket.handshake.headers.authorization,
    },
  })
  try {
    socket.$channel = await
    socket.$user
      .related('textChannels')
      .query()
      .where('id', socket.$channel_id)
      .preload('users')
      .firstOrFail()
    next()
  } catch (error) {
    next(new Error('#ERR_CHAT_EXISTS_OR_NOT_ALLOWED'))
  }
})
parent.on('connection', async (socket: Socket) => {
  //const namespace = socket.nsp.name

  socket.on('load:messages', async (lastMessageId: number) => {
    const messages = await socket.$channel.related('messages')
      .query()
      .apply(scopes => scopes.preloadMessages(lastMessageId))
    socket.emit('load:messages', messages)
  })

  socket.on('read:message', async (message_id: number) => {
    const message = await Message.findBy('id', message_id)
    if (message && message.authorId !== socket.$user.id) {
      message.readState = true
      socket.broadcast.emit('read:message', message_id)
      await message.save()
    }
  })

  socket.on('type:enabled', () => {
    socket.broadcast.emit('type:enabled', {
      uid: socket.$user.id,
    })
  })
  socket.on('type:disable', () => {
    socket.broadcast.emit('type:disable', {
      uid: socket.$user.id,
    })
  })
  socket.on('disconnect', () => {
    socket.broadcast.emit('type:disable', {
      id: socket.$user.id,
    })
  })
})
