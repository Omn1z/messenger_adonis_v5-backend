import {rules, schema} from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UsernameValidator {
  constructor (protected ctx: HttpContextContract) {
  }

  public schema = schema.create({
    username: schema.string({}, [
      rules.required(),
      rules.minLength(5),
      rules.regex(/^[a-zA-Z0-9_-]*$/),
    ]),
  })

  public messages = {
    'username.required': '#ERR_USERNAME_REQUIRED',
    'username.minLength': '#ERR_USERNAME_MIN_LENGTH',
    'username.regex': '#ERR_USERNAME_REGEX',
  }
}
