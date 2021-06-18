import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import {BaseModel, beforeSave, column} from '@ioc:Adonis/Lucid/Orm'

export default class SmsCode extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public uid: number

  @column()
  public code: string

  @column()
  public used: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeSave()
  public static async hashCode (smsCode: SmsCode) {
    if (smsCode.$dirty.code) {
      smsCode.code = await Hash.make(`${smsCode.code}${smsCode.uid}`)
    }
  }
}
