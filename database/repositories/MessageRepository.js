import db from "../services/database.js";
import BaseRepository from "./BaseRepository.js";

class MessageRepository extends BaseRepository{

    constructor(){

        super("messages");

    }

    save(message){

        db.prepare(`

            INSERT OR REPLACE INTO messages(

                id,
                chat_id,
                from_me,
                body,
                type,
                timestamp,
                has_media,
                media_id,
                author,
                forwarded,
                status,
                reply_to

            )

            VALUES(

                @id,
                @chat_id,
                @from_me,
                @body,
                @type,
                @timestamp,
                @has_media,
                @media_id,
                @author,
                @forwarded,
                @status,
                @reply_to

            )

        `).run(message);

    }

}

export default new MessageRepository();
