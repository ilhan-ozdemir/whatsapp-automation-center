import db from "../services/database.js";
import BaseRepository from "./BaseRepository.js";

class ChatRepository extends BaseRepository{

    constructor(){

        super("chats");

    }

    save(chat){

        db.prepare(`

            INSERT OR REPLACE INTO chats(

                id,
                name,
                is_group,
                unread_count,
                last_message_id,
                updated_at

            )

            VALUES(

                @id,
                @name,
                @is_group,
                @unread_count,
                @last_message_id,
                @updated_at

            )

        `).run(chat);

    }

}

export default new ChatRepository();
