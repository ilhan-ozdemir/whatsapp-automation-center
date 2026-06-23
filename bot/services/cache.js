import MessageRepository from "../database/repositories/MessageRepository.js";

export async function cacheChat(chat){

    const messages=await chat.fetchMessages({

        limit:100

    });

    for(const message of messages){

        MessageRepository.save({

            id:message.id.id,

            chat_id:chat.id._serialized,

            from_me:message.fromMe ? 1 : 0,

            body:message.body || "",

            type:message.type,

            timestamp:message.timestamp,

            has_media:message.hasMedia ? 1 : 0,

            media_endpoint:message.hasMedia

                ? `/media/${message.id.id}`

                : null,

            author:message.author || null,

            forwarded:

                message.forwardingScore>0 ? 1 : 0,

            status:null,

            reply_to:null

        });

    }

}
