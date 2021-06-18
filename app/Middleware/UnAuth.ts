import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UnAuth {
  public async handle ({ auth, response }: HttpContextContract, next: () => Promise<void>) {
    if (await auth.use('api').check()) {
      return response.methodNotAllowed({ error: 'ERR_AUTHORIZED'})
    }
    await next()
  }
}
