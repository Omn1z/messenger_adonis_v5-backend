import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class AuthMiddleware {
  public async handle ({ auth, response }: HttpContextContract, next: () => Promise<void>) {
    if (await auth.check()) {
      return await next()
    }
    response.unauthorized()
  }
}
