import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class UsersSchema extends BaseSchema {
  protected tableName = 'users'
  protected pivotChannels = 'users_channels'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('phone', 32).notNullable().unique()
      table.string('username').notNullable().unique()
      table.string('firstname').defaultTo('User')
      table.string('surname').nullable()
      table.string('avatar').defaultTo('default.png')
      table.boolean('online').defaultTo(false)
      table.timestamp('seen_at', { useTz: true }).notNullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
    this.schema.createTable(this.pivotChannels, (table) => {
      table.integer('channel_id').unsigned().notNullable()
      table.integer('user_id').unsigned().notNullable()
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
    this.schema.dropTable(this.pivotChannels)
  }
}
