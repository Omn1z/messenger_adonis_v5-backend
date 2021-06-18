import {rules, schema} from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateChannelValidator {
  constructor (protected ctx: HttpContextContract) {
  }

  public selfId = this.ctx.auth.use('api').user?.id || 0
  public schema = schema.create({
    members: schema.array([
      rules.required(),
      rules.minLength(1),
      rules.noDuplicates(),
    ]).members(schema.number([
      rules.unsigned(),
      rules.notIn([this.selfId]),
      rules.exists({ table: 'users', column: 'id' }),
    ])),
  })

  public messages = {
    'members.required': '#ERR_MEMBERS_REQUIRED',
    'members.minLength': '#ERR_MEMBERS_MIN_LENGTH',
    'members.*.number': '#ERR_MEMBERS_TYPE_USERID',
    'members.*.unsigned': '#ERR_MEMBERS_TYPE_USERID',
    'members.*.notIn': '#ERR_MEMBERS_EXCEPT_SELF',
  }
}
