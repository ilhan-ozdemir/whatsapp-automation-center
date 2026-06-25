import logger from "../logger.js";

class Sender {

    random(min, max) {

        return Math.floor(
            Math.random() * (max - min + 1)
        ) + min;

    }

    async sleep(ms) {

        return new Promise(resolve =>
            setTimeout(resolve, ms)
        );

    }

    async sendWithRetry(client, target, payload, options = {}) {

        const retries = 3;

        for (let attempt = 1; attempt <= retries; attempt++) {

            try {

                await client.sendMessage(
                    target,
                    payload,
                    options
                );

                return true;

            } catch (err) {

                logger.warn(
                    `Send failed (${attempt}/${retries}) : ${err.message}`
                );

                if (attempt < retries) {

                    await this.sleep(2000);

                }

            }

        }

        return false;

    }

    async flush(client, rule, session) {

        logger.info(
            `Forwarding ${session.messages.length} message(s)...`
        );

        const startupDelay =
            this.random(
                rule.randomDelayMin || 2,
                rule.randomDelayMax || 8
            ) * 1000;

        logger.info(
            `Waiting ${startupDelay} ms`
        );

        await this.sleep(startupDelay);

        for (const target of rule.targets) {

            logger.info(
                `Forward target -> ${target}`
            );

            for (const item of session.messages) {

                try {

                    switch (item.type) {

                        case "chat":

                            if (
                                item.body &&
                                item.body.trim() !== ""
                            ) {

                                await this.sendWithRetry(

                                    client,

                                    target,

                                    item.body

                                );

                            }

                            break;

                        case "image":

                        case "video":

                        case "document":

                        case "audio":

                        case "ptt":

                            await this.sendWithRetry(

                                client,

                                target,

                                item.media,

                                {

                                    caption:
                                        item.caption ||
                                        item.body ||
                                        ""

                                }

                            );

                            break;

                        default:

                            logger.warn(
                                `Unsupported type : ${item.type}`
                            );

                    }

                    const pause =
                        this.random(700, 2200);

                    await this.sleep(pause);

                } catch (err) {

                    logger.error(
                        err.message
                    );

                }

            }

        }

        logger.info(
            "Forward completed."
        );

    }

}

export default new Sender();
