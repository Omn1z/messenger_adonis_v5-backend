import Application from '@ioc:Adonis/Core/Application'
import { MultipartFileContract } from '@ioc:Adonis/Core/BodyParser'
import md5 from 'md5'
class FileManager {
  public async save (file: MultipartFileContract, path = 'uploads'): Promise<string> {
    const name = `${md5(`${Date.now()}.${file.clientName}`)}.${file.extname}`
    await file.move(Application.tmpPath(path), {
      name: name,
    })
    return name
  }
}
export default new FileManager()
