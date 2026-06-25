import logger from "../logger.js";

class MessageQueue {

    isMedia(message) {

        return [

            "image",

            "video",

            "document",

            "audio",

            "ptt"

        ].includes(message.type);

    }

    async queue(session, message) {

        const item = {

            id:

                message.id?._serialized ||

                message.id?.id ||

                "",

            type: message.type,

            body: message.body || "",

            caption: message.caption || "",

            timestamp: message.timestamp,

            filename: message.filename || "",

            media: null

        };

        if (this.isMedia(message)) {

            logger.info(

                `Downloading ${message.type}...`

            );

            try {

                item.media =
                    await message.downloadMedia();

            } catch (err) {

                logger.error(

                    `downloadMedia failed : ${err.message}`

                );

                return false;

            }

            if (!item.media) {

                logger.warn(
                    "downloadMedia() returned null."
                );

                return false;

            }

            logger.info(

                `Media downloaded (${item.media.mimetype})`

            );

        }

        session.messages.push(item);

        logger.info(

            `Queued ${item.type} (${session.messages.length})`

        );

        return true;

    }

}

export default new MessageQueue();
