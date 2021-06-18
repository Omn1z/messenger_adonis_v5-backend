import { DateTime } from 'luxon'
import {BaseModel, column, belongsTo, BelongsTo, manyToMany, ManyToMany, scope} from '@ioc:Adonis/Lucid/Orm'
import TextChannel from './TextChannel'
import User from './User'
import Asset from './Asset'

export default class Message extends BaseModel {
  @column({ isPrimary: true, serializeAs: 'message_id' })
  public id: number

  @column()
  public channelId: number

  @column()
  public authorId: number

  @belongsTo(() => TextChannel, { foreignKey: 'channelId' })
  public channel: BelongsTo<typeof TextChannel>

  @belongsTo(() => User, {
    localKey: 'id',
    foreignKey: 'authorId',
  })
  public author: BelongsTo<typeof User>

  @column()
  public reply: boolean

  @manyToMany(() => Message, {
    localKey: 'id',
    pivotForeignKey: 'parent_message_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'message_id',
    pivotTable: 'forwarded_messages',
    onQuery: (query) => {
      if (!query.isRelatedSubQuery) {
        query.preload('forwards').preload('author').preload('assets')
      }
    },
  })
  public forwards: ManyToMany<typeof Message>

  @column()
  public message: string

  @manyToMany(() => Asset, {
    localKey: 'id',
    pivotForeignKey: 'message_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'asset_id',
    pivotTable: 'message_assets',
  })
  public assets: ManyToMany<typeof Asset>

  @column()
  public readState: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  public updatedAt: DateTime

  public static preloadMessages = scope<typeof Message>((query, lastMessageId) => {
    return query
      .where('id', '<', lastMessageId)
      .orderBy('id', 'desc')
      .limit(20)
      .preload('author')
      .preload('forwards')
      .preload('assets')
  })
}
