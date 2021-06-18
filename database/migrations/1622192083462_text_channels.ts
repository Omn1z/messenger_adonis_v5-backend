import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class TextChannels extends BaseSchema {
  protected tableName = 'text_channels'
  protected pivotUsers = 'text_channel_users'
  protected pivotMessages = 'text_channel_messages'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('type').defaultTo(2)
      table.string('name').defaultTo('Private')
      table.timestamp('message_at', { useTz: true })
      /**
       * Uses timestampz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
    this.schema.createTable(this.pivotUsers, (table) => {
      table.integer('user_id').unsigned().notNullable()
      table.integer('text_channel_id').unsigned().notNullable()
      table.string('role').notNullable()
    })
    this.schema.createTable(this.pivotMessages, (table) => {
      table.integer('message_id').unsigned().notNullable()
      table.integer('text_channel_id').unsigned().notNullable()
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
    this.schema.dropTable(this.pivotUsers)
    this.schema.dropTable(this.pivotMessages)
  }
}
