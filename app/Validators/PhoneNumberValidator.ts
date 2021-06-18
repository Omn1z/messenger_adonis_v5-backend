import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class PhoneNumberValidator {
  constructor (protected ctx: HttpContextContract) {
  }

  public schema = schema.create({
    phone: schema.string({}, [
      rules.required(),
      rules.mobile({
        strict: true,
        locales: ['ru-RU', 'uk-UA', 'be-BY'],
      }),
    ]),
  })

  public messages = {
    'phone.mobile': '#ERR_HASNT_SUPPORT_IN_PHONENUMBER_REGION',
  }
}
