import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { appKey } from 'Config/app'

export default class LocalHost {
  public async handle ({ request, response }: HttpContextContract, next: () => Promise<void>) {
    if(appKey === request.headers().adonishostkey) {
      return await next()
    }
    response.badRequest()
  }
}
