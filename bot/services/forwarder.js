import fs from "fs";
import AlarmSession from "./alarmSession.js";
import logger from "../logger.js";

const CONFIG_FILE = "/app/config/forwarder.json";

class Forwarder {

    constructor() {

        this.config = {
            rules: []
        };

        this.load();

    }

    load() {

        try {

            this.config = JSON.parse(
                fs.readFileSync(CONFIG_FILE, "utf8")
            );

            logger.info(
                `Forward rules loaded (${this.config.rules.length})`
            );

        } catch (err) {

            logger.error(err.message);

        }

    }

    getSource(message) {

        if (message.to && message.to.endsWith("@g.us"))
            return message.to;

        if (message.from && message.from.endsWith("@g.us"))
            return message.from;

        return message.from;

    }

    findRule(message) {

        const source = this.getSource(message);

        for (const rule of this.config.rules) {

            if (!rule.enabled)
                continue;

            if (!rule.sources)
                continue;

            if (rule.sources.includes(source))
                return rule;

        }

        return null;

    }

    isMedia(message) {

        return [

            "image",
            "video",
            "document",
            "audio",
            "ptt"

        ].includes(message.type);

    }

    async queueMessage(session,message){

        const item={

            type:message.type,

            body:message.body || "",

            caption:message.caption || "",

            timestamp:message.timestamp,

            media:null

        };

        if(this.isMedia(message)){

            logger.info(
                "Downloading media..."
            );

            try{

                item.media=
                    await message.downloadMedia();

            }catch(err){

                logger.error(err.message);

                return false;

            }

            if(!item.media){

                logger.warn(
                    "downloadMedia() returned null"
                );

                return false;

            }

        }

        session.messages.push(item);

        logger.info(

            `Queued ${item.type} (${session.messages.length})`

        );

        return true;

    }

    async handle(client,message){

        const rule=this.findRule(message);

        if(!rule)
            return;

        const source=this.getSource(message);

        let session=
            AlarmSession.get(source);

        if(!session){

            if(!this.isMedia(message))
                return;

            session=
                AlarmSession.create(source);

        }

        const ok=
            await this.queueMessage(
                session,
                message
            );

        if(!ok)
            return;
        AlarmSession.resetTimer(

            source,

            rule.sessionTimeout || 30,

            async finishedSession => {

                logger.info(
                    `Forwarding ${finishedSession.messages.length} message(s)...`
                );

                const min =
                    rule.randomDelayMin || 2;

                const max =
                    rule.randomDelayMax || 8;

                const startupDelay =

                    (Math.floor(
                        Math.random() *
                        ((max - min + 1) * 1000)
                    )) +

                    (min * 1000);

                logger.info(
                    `Waiting ${startupDelay} ms`
                );

                await new Promise(resolve =>
                    setTimeout(resolve, startupDelay)
                );

                for (const target of rule.targets) {

                    logger.info(
                        `Target : ${target}`
                    );

                    for (const item of finishedSession.messages) {

                        try {

                            switch (item.type) {

                                case "chat":

                                    if (
                                        item.body &&
                                        item.body.trim() !== ""
                                    ) {

                                        await client.sendMessage(
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

                                    await client.sendMessage(

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
                                        `Unknown type ${item.type}`
                                    );

                            }

                            const pause =

                                500 +

                                Math.floor(
                                    Math.random() * 1200
                                );

                            await new Promise(resolve =>
                                setTimeout(resolve, pause)
                            );

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

        );

    }
}

export default new Forwarder();
