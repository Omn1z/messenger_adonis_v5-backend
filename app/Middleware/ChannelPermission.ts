import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ChannelPermission {
  public async handle ({ auth, params, response }: HttpContextContract, next: () => Promise<void>) {
    const user = auth.user!
    const channel = await user.related('textChannels').query().where('id', params.channel_id).first()
    if(!channel) {
      return response.unprocessableEntity({
        errors: [
          {
            message: '#ERR_MEMBER_NOT_EXISTS_IN_CHANNEL',
          },
        ],
      })
    }
    params.channel = channel
    await next()
  }
}
