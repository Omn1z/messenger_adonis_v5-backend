import Route from '@ioc:Adonis/Core/Route'
import User from 'App/Models/User'
import SmsCode from 'App/Models/SmsCode'
import axios from 'axios'
import { base64 } from '@ioc:Adonis/Core/Helpers'
import PhoneNumberValidator from 'App/Validators/PhoneNumberValidator'
import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class AuthController {
  public async getUsername () {
    const code = Math.floor(10000000000 + Math.random() * 90000000000)
    if(await User.findBy('username', code.toString())) {
      return await this.getUsername()
    }
    return code.toString()
  }
  public async update ({ auth, response }: HttpContextContract) {
    const user = auth.use('api').user
    if(!user) {
      return response.unauthorized()
    }
    response.status(200).send({
      user: user,
      token: await auth.use('api').generate(user, {
        expiresIn: '7days',
      }),
    })
  }
  public async generate ({ request, response }: HttpContextContract) {
    try {
      await request.validate(PhoneNumberValidator)
      const phone = request.input('phone')
      const code = Math.floor(100000 + Math.random() * 900000)/*145955*/
      const smsResponse = await axios.get('https://sms.ru/sms/send', {
        params: {
          api_id: '2AA20678-6074-6AD9-0A35-740FD53B9BA1',
          to: phone,
          msg: `fecurity: ${code} - your code`,
          json: 1,
        },
        timeout: 3000,
      })

      if (smsResponse.data.status_code !== 100) {
        return response.badRequest({error: smsResponse.data.status_text})
      }

      let user = await User.findBy('phone', phone)
      if(!user) {
        user = await User.create({
          phone: phone,
          username: await this.getUsername(),
        })
        await user.refresh()
        user.seenAt = user.createdAt
        await user.save()
      }
      const smsCode = new SmsCode()
      smsCode.uid = user.id
      smsCode.code = code.toString()
      await smsCode.save()
      const url = Route.makeSignedUrl(
        'verifyMobileCode',
        {
          phone: base64.encode(phone),
          code: code.toString(),
        },
        {
          expiresIn: '5m',
        }
      )
      response.status(201).send({
        url: url.slice(0, url.lastIndexOf('/') + 1),
        signature: url.slice(url.lastIndexOf('?signature=') + 11),
        user: user,
      })
    } catch (error) {
      response.badRequest(error)
    }
  }
  public async sms ({ auth, params, request, response }: HttpContextContract) {
    if (request.hasValidSignature()) {
      const phone = base64.decode(params.phone)
      const user = await User.findByOrFail('phone', phone)
      const smsCodes = await SmsCode.query()
        .where('uid', user.id)
        .where('used', false)
        .where('created_at', '>', DateTime.now().minus({minutes: 5}).toSQL())
      let generate = false
      for (let i = 0; i < smsCodes.length; i++) {
        const smsCode = smsCodes[i]
        if(await Hash.verify(smsCode.code, `${params.code}${user.id}`)) {
          smsCode.used = true
          await smsCode.save()
          generate = true
        }
      }
      if(generate) {
        const token = await auth.use('api').generate(user, {
          expiresIn: '7days',
        })
        return response.status(200).send(token)
      }
    }
    return response.status(403)
  }
}
