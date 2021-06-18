import {rules, schema} from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class GetChannelListPageValidator {
  constructor (protected ctx: HttpContextContract) {
  }

  public schema = schema.create({
    page: schema.number([
      rules.required(),
      rules.unsigned(),
    ]),
  })

  public messages = {
    'page.required': '#ERR_CHANNEL_PAGE_REQUIRED',
    'page.unsigned': '#ERR_CHANNEL_PAGE_UNSIGNED',
  }
}
