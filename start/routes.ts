/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.group((): void => {
  Route.group((): void => {
    Route.group((): void => {
      Route.get('sms/:phone/:code', 'AuthController.sms').as('verifyMobileCode')
      Route.get('generate', 'AuthController.generate')
    }).middleware('unauth')
    Route.get('update', 'AuthController.update').middleware('auth')
  }).prefix('auth')
  Route.group((): void => {
    Route.get('username/change', 'UserController.usernameChange')
    Route.get('username/valid', 'UserController.usernameValid')
    Route.get('name/change', 'UserController.nameChange')
    Route.put('avatar/upload', 'UserController.uploadAvatar')
    Route.get('local', 'UserController.local')
  }).prefix('user').middleware('auth')
  Route.group((): void => {
    Route.get('findByAny', 'MessengerController.findByAny')
    Route.get('findByTag', 'MessengerController.findByTag')
  }).prefix('messenger').middleware('auth').middleware('localhost')
  Route.group((): void => {
    Route.get('update/online', 'MessengerController.updateOnline')
    Route.get('create/text/channel', 'ChatController.createTextChannel')
  }).prefix('messenger').middleware('localhost')
  Route.group((): void => {
    Route.get('create/text/', 'ChannelController.createTextChannel')
    //Route.get('find/text/', 'ChannelController.getTextChannel')
  }).prefix('channel').middleware('auth')
  Route.group((): void => {
    Route.put(':channel_id/message/create', 'ChannelController.createMessage')
  }).prefix('channel').middleware('auth').middleware('channelExist')
}).prefix('api')
Route.group((): void => {
  Route.get('a/:url', 'StorageController.downloadAvatars')
  Route.get('s/:url', 'StorageController.downloadUploads')
  Route.get('c/:url', 'StorageController.downloadCores')
  Route.get('assets/:key/:verify_key/:name', 'StorageController.downloadAsset')
}).prefix('storage')

