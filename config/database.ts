/**
 * Config source: https://git.io/JesV9
 *
 * Feel free to let us know via PR, if you find something broken in this config
 * file.
 */

import Env from '@ioc:Adonis/Core/Env'
import { DatabaseConfig } from '@ioc:Adonis/Lucid/Database'

const databaseConfig: DatabaseConfig = {
  /*
  |--------------------------------------------------------------------------
  | Connection
  |--------------------------------------------------------------------------
  |
  | The primary connection for making database queries across the application
  | You can use any key from the `connections` object defined in this same
  | file.
  |
  */
  connection: Env.get('DB_CONNECTION'),

  connections: {
    /*
    |--------------------------------------------------------------------------
    | MSSQL config
    |--------------------------------------------------------------------------
    |
    | Configuration for MSSQL database. Make sure to install the driver
    | from npm when using this connection
    |
    | npm i mssql
    |
    */
    mssql: {
      client: 'mssql',
      connection: {
        user: 'SA',
        port: 1433,
        server: '194.58.98.158',
        password: 'ooHai7aif9uh',
        database: 'FecurityDB',
      },
      migrations: {
        naturalSort: true,
      },
      healthCheck: false,
      debug: false,
    },
  },
}

export default databaseConfig
