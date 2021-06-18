import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import UsernameTagValidator from 'App/Validators/UsernameTagValidator'
import User from 'App/Models/User'

export default class MessengerController {
  public async findByAny ({response} : HttpContextContract) {
    //TODO Сделать поиск по пользователям а так же чатам
    response.ok(null)
  }
  public async findByTag ({request, response} : HttpContextContract) {
    try {
      await request.validate(UsernameTagValidator)
    } catch (error) {
      return response.badRequest(error.messages)
    }
    response.ok(await
    User.query().
      where('username', 'like', `%${request.input('username').slice(1)}%`))
  }
}
