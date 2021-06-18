import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Messages extends BaseSchema {
  protected tableName = 'messages'
  protected pivotForwarded = 'forwarded_messages'
  protected pivotAssets = 'message_assets'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('channel_id').unsigned()
      table.integer('author_id').unsigned()
      table.boolean('reply').defaultTo(false)
      table.string('message').defaultTo('')
      table.boolean('read_state').defaultTo(false)
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
    this.schema.createTable(this.pivotForwarded, (table) => {
      table.integer('message_id').unsigned().notNullable()
      table.integer('parent_message_id').unsigned().notNullable()
    })
    this.schema.createTable(this.pivotAssets, (table) => {
      table.integer('asset_id').unsigned().notNullable()
      table.integer('message_id').unsigned().notNullable()
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
    this.schema.dropTable(this.pivotForwarded)
    this.schema.dropTable(this.pivotAssets)
  }
}
