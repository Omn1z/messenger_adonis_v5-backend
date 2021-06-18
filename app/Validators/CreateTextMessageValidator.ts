import { rules, schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateTextMessageValidator {
  constructor (protected ctx: HttpContextContract) {
  }

  public schema = schema.create({
    message: schema.string.optional({}, [
      rules.requiredIfNotExistsAll(['forwarded', 'images', 'medias', 'files']),
    ]),
    forwarded: schema.array.optional([
      rules.requiredIfNotExistsAll(['message', 'images', 'medias', 'files']),
    ]).members(schema.number([
      rules.unsigned(),
      rules.exists({ table: 'messages', column: 'id' }),
    ])),
    reply: schema.boolean.optional([
      rules.requiredIfExists('forwarded'),
    ]),
    images: schema.array.optional([
      rules.requiredIfNotExistsAll(['message', 'forwarded', 'medias', 'files']),
    ]).members(schema.file({
      size: '4mb',
      extnames: ['jpg', 'jpeg', 'gif', 'png'],
    }, [
      rules.required(),
    ])),
    medias: schema.array.optional([
      rules.requiredIfNotExistsAll(['message', 'forwarded', 'images', 'files']),
    ]).members(schema.file({
      size: '20mb',
      extnames: ['mp4', 'mp3', 'ogg', 'flac', 'aac', 'alac'], //Aurora.js
    }, [
      rules.required(),
    ])),
    files: schema.array.optional([
      rules.requiredIfNotExistsAll(['message', 'forwarded', 'images', 'medias']),
    ]).members(schema.file({
      size: '20mb',
    }, [
      rules.required(),
    ])),
  })

  public messages = {}
}
