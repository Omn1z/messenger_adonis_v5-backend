import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import fs from 'fs'
import Application from '@ioc:Adonis/Core/Application'
import Asset from 'App/Models/Asset'

export default class StorageController {
  public async downloadAvatars ({params, response}: HttpContextContract) {
    if (!fs.existsSync(Application.tmpPath(`avatars/${params.url}`))) {
      return response.forbidden()
    }
    response.download(Application.tmpPath(`avatars/${params.url}`))
  }
  public async downloadUploads ({params, response}: HttpContextContract) {
    if (!fs.existsSync(Application.tmpPath(`uploads/${params.url}`))) {
      return response.forbidden()
    }
    response.download(Application.tmpPath(`uploads/${params.url}`))
  }
  public async downloadCores ({params, response}: HttpContextContract) {
    if (!fs.existsSync(Application.tmpPath(`core/${params.url}`))) {
      return response.forbidden()
    }
    response.download(Application.tmpPath(`core/${params.url}`))
  }

  public async downloadAsset ({params, response}: HttpContextContract) {
    const asset = await Asset.query()
      .where('key', params.key)
      .where('verify_key', params.verify_key)
      .where('name', params.name)
      .first()
    if (!asset) {
      return response.forbidden()
    }
    if(asset.type === 1) {
      return response.download(Application.tmpPath(`assets/images/${params.name}`))
    } else if(asset.type === 2) {
      return response.download(Application.tmpPath(`assets/files/${params.name}`))
    } else if(asset.type === 3) {
      return response.download(Application.tmpPath(`assets/media/${params.name}`))
    } else {
      return response.forbidden()
    }
  }
}
