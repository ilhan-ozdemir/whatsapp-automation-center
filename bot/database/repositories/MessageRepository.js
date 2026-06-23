import db from "../services/database.js";

class MessageRepository{

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
                media_endpoint,
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
                @media_endpoint,
                @author,
                @forwarded,
                @status,
                @reply_to

            )

        `).run(message);

    }

    getByChat(chatId,limit=100){

        return db.prepare(`

            SELECT *

            FROM messages

            WHERE chat_id=?

            ORDER BY timestamp DESC

            LIMIT ?

        `).all(chatId,limit);

    }

    get(id){

        return db.prepare(

            `SELECT * FROM messages WHERE id=?`

        ).get(id);

    }

}

export default new MessageRepository();
