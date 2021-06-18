import Message from 'App/Models/Message'
import User from 'App/Models/User'

declare module '@ioc:Adonis/Core/Event' {
  interface EventsList {
    'new:message': { message: Message },
    'user:changed': { user: User }
  }
}
