import MessageRepository from "../database/repositories/MessageRepository.js";
import { cacheMedia } from "./media.js";
import logger from "../logger.js";

class MessageService {

    async save(message) {

        try {

            let mediaEndpoint = null;

            if (message.hasMedia) {

                const media = await cacheMedia(message);

                if (media) {
                    mediaEndpoint = `/media/${message.id.id}`;
                }

            }

            MessageRepository.save({

                id: message.id.id,

                chat_id: message.from,

                from_me: message.fromMe ? 1 : 0,

                body: message.body || "",

                type: message.type,

                timestamp: message.timestamp,

                has_media: message.hasMedia ? 1 : 0,

                media_endpoint: mediaEndpoint,

                author: message.author || null,

                forwarded: message.forwardingScore > 0 ? 1 : 0,

                status: null,

                reply_to: null

            });

            logger.info(
                `Message saved : ${message.id.id}`
            );

        } catch (err) {

            logger.error(
                `MessageService : ${err.message}`
            );

        }

    }

}

export default new MessageService();
