import { DateTime } from 'luxon'
import {BaseModel, column, manyToMany, ManyToMany, scope} from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Message from './Message'

export default class TextChannel extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public type: number

  @column()
  public name: string

  @manyToMany(() => User, {
    localKey: 'id',
    pivotForeignKey: 'text_channel_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'user_id',
    pivotTable: 'text_channel_users',
    pivotColumns: ['role'],
    serializeAs: 'members',
  })
  public users: ManyToMany<typeof User>

  @manyToMany(() => Message, {
    localKey: 'id',
    pivotForeignKey: 'text_channel_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'message_id',
    pivotTable: 'text_channel_messages',
    pivotColumns: [],
  })
  public messages: ManyToMany<typeof Message>

  @column.dateTime({ autoCreate: true })
  public messageAt: DateTime

  @column.dateTime({ autoCreate: true, serializeAs: null })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  public updatedAt: DateTime

  public static preloadChannel = scope<typeof TextChannel>((
    query,
    messageAt: string = DateTime.now().toLocal().toISO()) => {
    return query
      .where('message_at', '<', messageAt)
      .whereNotColumn('message_at', 'created_at')
      .orderBy('updated_at', 'desc')
      .limit(10)
      .preload('messages', (messagesQuery) => {
        messagesQuery
          .groupLimit(20)
          .groupOrderBy('id', 'desc')
          .preload('author')
          .preload('forwards')
          .preload('assets')
      })
      .preload('users')
  })
}
