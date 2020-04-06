import { DatabaseConfiguration, RowDataPacket } from '../dto/interfaces';
import * as MySQL from 'mysql';

export class SQL {
  
    private poolConfiguration: {};
    private pool: MySQL.Pool;
    private connection: void

    constructor(configuration: DatabaseConfiguration) {
        this.poolConfiguration = {
            host: configuration.host,
            user: configuration.user,
            password: configuration.password,
            database: configuration.database
        }
        //establish pool connection with db config and handle errors
        this.pool = MySQL.createPool(this.poolConfiguration)
        this.connection = this.pool.getConnection((err, connection) => {
            if (err) {
                if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                    console.error('Database connection was closed.')
                }
                if (err.code === 'ER_CON_COUNT_ERROR') {
                    console.error('Database has too many connections.')
                }
                if (err.code === 'ECONNREFUSED') {
                    console.error('Database connection was refused.')
                }
            }
            if (connection) connection.release()
            return
        })
    }  

    
    selectTableColumns() {

        const selectString = `DESCRIBE airbus_ctc.livehotforming;`;

        const promise: Promise<RowDataPacket[]> = new Promise((resolve, reject) => {
            // do a thing, possibly async, then…
            this.pool.query(selectString, (err, results, fields) => {
                if (err) reject(err);
                console.log("SQL executed...");
                // resolve 
                resolve(results);
            });
        });

        return promise
    }

    endConnection(){
        this.pool.end(err => {
            console.log(err)
        })
    }

}


