import { DateTime } from 'luxon'
import {BaseModel, beforeCreate, column, computed} from '@ioc:Adonis/Lucid/Orm'
import md5 from 'md5'
import { string } from '@ioc:Adonis/Core/Helpers'
import {MultipartFileContract} from '@ioc:Adonis/Core/BodyParser'
import Application from '@ioc:Adonis/Core/Application'

export default class Asset extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column({ serializeAs: null })
  public key: string

  @column({ serializeAs: null })
  public verify_key: string

  @column()
  public type: number

  @column()
  public name: string

  @column()
  public data: string

  @column.dateTime({ autoCreate: true, serializeAs: null })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  public updatedAt: DateTime

  @computed()
  public get url () {
    return `storage/assets/${this.key}/${this.verify_key}/${this.name}`
  }

  @beforeCreate()
  public static assignKeys (asset: Asset) {
    asset.key = md5(`${DateTime.now()}${string.generateRandom(32)}`)
    asset.verify_key = string.generateRandom(8)
  }

  public async setImage (file: MultipartFileContract) {
    this.type = 1
    this.name = `${md5(`${DateTime.now()}.${file.clientName}`)}.${file.extname}`
    await file.move(Application.tmpPath('assets/images/'), {
      name: this.name,
    })
    this.data = JSON.stringify({
      clientName: file.clientName,
      size: file.size,
    })
  }
  public async setFile (file: MultipartFileContract) {
    this.type = 2
    this.name = `${md5(`${DateTime.now()}.${file.clientName}`)}.${file.extname}`
    await file.move(Application.tmpPath('assets/files/'), {
      name: this.name,
    })
    this.data = JSON.stringify({
      clientName: file.clientName,
      size: file.size,
    })
  }
  public async setMedia (file: MultipartFileContract) {
    this.type = 3
    this.name = `${md5(`${DateTime.now()}.${file.clientName}`)}.${file.extname}`
    await file.move(Application.tmpPath('assets/media/'), {
      name: this.name,
    })
    this.data = JSON.stringify({
      clientName: file.clientName,
      size: file.size,
    })
  }
  public set href (url: string) {
    this.type = 4
    this.data = JSON.stringify({
      url: url,
    })
  }
}
