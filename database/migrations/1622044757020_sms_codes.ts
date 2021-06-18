import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class SmsCodes extends BaseSchema {
  protected tableName = 'sms_codes'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('uid').unsigned()
      table.string('code')
      table.boolean('used').defaultTo(false)
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
