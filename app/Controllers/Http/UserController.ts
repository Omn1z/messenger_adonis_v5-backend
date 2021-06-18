import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ChangeNameValidator from 'App/Validators/ChangeNameValidator'
import AvatarValidator from 'App/Validators/AvatarValidator'
import User from 'App/Models/User'
import FileManager from 'App/Services/FileManager'
import ChangeUserNameValidator from 'App/Validators/ChangeUserNameValidator'

export default class UserController {
  public async uploadAvatar ({ auth, response, request }: HttpContextContract) {
    const { avatar } = await request.validate(AvatarValidator)
    const user = auth.use('api').user
    if (!user) {
      return response.unauthorized()
    }
    user.avatar = await FileManager.save(avatar, 'avatars')
    await user.save()
    response.accepted(null)
  }
  public async nameChange ({ auth, response, request }: HttpContextContract) {
    const { firstname, surname } = await request.validate(ChangeNameValidator)
    const user = auth.use('api').user
    if (!user) {
      return response.unauthorized()
    }
    user.firstname = firstname
    user.surname = surname ? surname : ''
    await user.save()
    response.accepted(null)
  }
  public async usernameValid ({ request }: HttpContextContract) {
    await request.validate(ChangeUserNameValidator)
  }
  public async usernameChange ({ auth, response, request }: HttpContextContract) {
    const { username } = await request.validate(ChangeUserNameValidator)
    const user = auth.use('api').user
    if (!user) {
      return response.unauthorized()
    }
    if (user.username === username) {
      return response.ok(null)
    }
    if (await User.findBy('username', username)) {
      return response.conflict()
    }
    user.username = username
    await user.save()
    response.accepted(null)
  }
  public async local ({ auth, response }: HttpContextContract) {
    const user = auth.use('api').user
    if(!user) {
      return response.unauthorized()
    }
    response.status(200).send(user)
  }
}
