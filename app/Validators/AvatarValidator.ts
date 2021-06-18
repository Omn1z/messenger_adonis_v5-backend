import {rules, schema} from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class AvatarValidator {
  constructor (protected ctx: HttpContextContract) {
  }

  public schema = schema.create({
    avatar: schema.file({
      size: '4mb',
      extnames: ['jpg', 'jpeg', 'gif', 'png'],
    }, [
      rules.required(),
    ]),
  })

  public messages = {
    'avatar.required': '#ERR_FILE_REQUIRED',
    'avatar.size': '#ERR_FILE_SIZE',
    'avatar.extnames': '#ERR_FILE_EXTNAMES',
  }
}
