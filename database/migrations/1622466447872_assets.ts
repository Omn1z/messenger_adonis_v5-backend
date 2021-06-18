import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Assets extends BaseSchema {
  protected tableName = 'assets'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('key')
      table.string('verify_key')
      table.integer('type')
      table.string('name').defaultTo('')
      table.json('data').nullable()

      /**
       * Uses timestampz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
