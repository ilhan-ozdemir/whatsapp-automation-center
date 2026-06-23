import db from "../services/database.js";

export default class BaseRepository{

    constructor(table){

        this.table=table;

    }

    findById(id){

        return db.prepare(

            `SELECT * FROM ${this.table}
             WHERE id=?`

        ).get(id);

    }

    delete(id){

        return db.prepare(

            `DELETE FROM ${this.table}
             WHERE id=?`

        ).run(id);

    }

    all(){

        return db.prepare(

            `SELECT * FROM ${this.table}`

        ).all();

    }

}
