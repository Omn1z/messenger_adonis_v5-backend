import {rules, schema} from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ChangeNameValidator {
  constructor (protected ctx: HttpContextContract) {
  }

  public schema = schema.create({
    firstname: schema.string({}, [
      rules.minLength(1),
    ]),
    surname: schema.string.optional(),
  })

  public messages = {
    'firstname.required': '#ERR_FIRSTNAME_REQUIRED',
  }
}
