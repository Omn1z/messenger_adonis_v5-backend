import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import CreateChannelValidator from 'App/Validators/CreateChannelValidator'
import TextChannel from 'App/Models/TextChannel'
import User from 'App/Models/User'
import CreateTextMessageValidator from 'App/Validators/CreateTextMessageValidator'
import Asset from 'App/Models/Asset'
import Message from 'App/Models/Message'
import Event from '@ioc:Adonis/Core/Event'
import { DateTime } from 'luxon'

export default class ChannelController {
  public async removeTextChannel ({ response }: HttpContextContract) {
    return response.ok(null)
  }
  public async createTextChannel ({ auth, request, response }: HttpContextContract) {
    const user = auth.use('api').user!
    const data = await request.validate(CreateChannelValidator)
    const members = data.members as Array<number>
    const privateChat = members.length <= 1
    if(privateChat) {
      const channels =
        await user.related('textChannels')
          .query()
          .where('type', 2)
          .preload('users')
      const result = channels.find((testChannel) => {
        return testChannel.users.find((testUser) => {
          return testUser.id === members[0]
        })
      })
      if(result) {
        return response.json(result)
      }
    }
    const channel = await TextChannel.create({
      type: privateChat ? 2 : 3,
      name: privateChat ? 'Private' : 'Group',
    })
    await user.related('textChannels').attach([channel.id])
    await channel.related('users').attach({
      [auth.use('api').user!.id]: {
        role: privateChat ? 'self' : 'admin',
      },
    })
    for (const memberId of members) {
      const member = await User.findByOrFail('id', memberId)
      await member.related('textChannels').attach([channel.id])
      await channel.related('users').attach({
        [memberId]: {
          role: privateChat ? 'self' : 'user',
        },
      })
    }

    await Promise.all([channel.load('users'), channel.load('messages')])
    return response.created(channel)
  }
  /*public async getTextChannel ({ auth, response, request }: HttpContextContract) {
    const user = auth.use('api').user!
    const { page } = await request.validate(GetChannelListPageValidator)
    const channels = await user.related('textChannels')
      .query()
      .apply(scopes => scopes.preloadChannel(DateTime.now().toLocal().toISO()))
    return response.ok(channels)
  }*/
  public async createMessage ({ auth, params, response, request }: HttpContextContract) {
    const data = await request.validate(CreateTextMessageValidator)
    const user = auth.use('api').user!
    const channel = params.channel as TextChannel
    const forwarded = data.forwarded as Array<number> | undefined
    const msg = request.input('message', '')
    const message = await Message.create({
      message: msg,
    })
    await message.related('author').associate(user)
    await message.related('channel').associate(channel)
    if(forwarded) {
      forwarded.sort((a, b) => a - b)
      message.reply = !!data.reply
      for (const fwdId of forwarded) {
        await message.related('forwards').attach([fwdId])
      }
    }

    if(data.images) {
      for (const image of data.images) {
        const asset = new Asset()
        await asset.setImage(image)
        await asset.save()
        await message.related('assets').attach([asset.id])
      }
    }
    if(data.medias) {
      for (const media of data.medias) {
        const asset = new Asset()
        await asset.setMedia(media)
        await asset.save()
        await message.related('assets').attach([asset.id])
      }
    }
    if(data.files) {
      for (const file of data.files) {
        const asset = new Asset()
        await asset.setFile(file)
        await asset.save()
        await message.related('assets').attach([asset.id])
      }
    }

    channel.messageAt = DateTime.now()
    await Promise.all([channel.save(), channel.related('messages').attach([message.id])])
    await Promise.all([message.refresh(),
      message.load('forwards'),
      message.load('assets'),
      message.load('author'),
      message.load('channel')])

    await Event.emit('new:message', {
      message: message,
    })

    response.created()
  }
}
