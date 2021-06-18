import { DateTime } from 'luxon'
import {
  column,
  computed,
  BaseModel,
  beforeCreate,
  manyToMany,
  ManyToMany,
  afterSave,
} from '@ioc:Adonis/Lucid/Orm'
import TextChannel from './TextChannel'
import Event from '@ioc:Adonis/Core/Event'

export default class User extends BaseModel {
  @column({ isPrimary: true, serializeAs: 'uid' })
  public id: number

  @column()
  public phone: string

  @column()
  public username: string

  @column()
  public firstname: string

  @column()
  public surname: string

  @column()
  public avatar: string

  @column()
  public online: boolean

  @column.dateTime({serializeAs: null})
  public seenAt: DateTime

  @manyToMany(() => TextChannel, {
    localKey: 'id',
    pivotForeignKey: 'user_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'channel_id',
    pivotTable: 'users_channels',
    pivotColumns: [],
  })
  public textChannels: ManyToMany<typeof TextChannel>

  @column.dateTime({ autoCreate: true, serializeAs: null })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  public updatedAt: DateTime

  @beforeCreate()
  public static assignSeenAt (asset: User) {
    asset.seenAt = DateTime.now()
  }

  @afterSave()
  public static async onDataChanged (user: User) {
    await Event.emit('user:changed', { user })
  }

  @computed()
  public get fullName () {
    return this.surname ? `${this.firstname} ${this.surname}` : this.firstname
  }

  @computed()
  public get lastSeen () {
    if(this.online) {
      return null
    }
    return DateTime.now().diff(this.seenAt,['years', 'months', 'days', 'hours', 'minutes']).toObject()
  }

  @computed()
  public get registered () {
    return !this.createdAt.equals(this.seenAt)
  }
}
