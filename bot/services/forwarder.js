import fs from "fs";

import AlarmSession from "./alarmSession.js";
import RuleMatcher from "./ruleMatcher.js";
import MessageQueue from "./messageQueue.js";
import Sender from "./sender.js";

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

                fs.readFileSync(
                    CONFIG_FILE,
                    "utf8"
                )

            );

            logger.info(

                `Forward rules loaded (${this.config.rules.length})`

            );

        } catch (err) {

            logger.error(

                err.message

            );

        }

    }

    async handle(client, message) {

        const rule =

            RuleMatcher.findRule(

                this.config,

                message

            );

        if (!rule)
            return;

        const source =

            RuleMatcher.getSource(

                message

            );

        let session =

            AlarmSession.get(

                source

            );

        if (!session) {

            if (

                !MessageQueue.isMedia(

                    message

                )

            )
                return;

            session =

                AlarmSession.create(

                    source

                );

        }

        const ok =

            await MessageQueue.queue(

                session,

                message

            );

        if (!ok)
            return;

        AlarmSession.resetTimer(

            source,

            rule.sessionTimeout || 30,

            async finishedSession => {
                await Sender.flush(

                    client,

                    rule,

                    finishedSession

                );

            }

        );

    }

    reload() {

        logger.info(

            "Reloading forwarder configuration..."

        );

        this.load();

    }

    getRules() {

        return this.config.rules;

    }

    hasRules() {

        return (

            this.config.rules &&

            this.config.rules.length > 0

        );

    }

    addRule(rule) {

        this.config.rules.push(

            rule

        );

    }

    removeRule(index) {

        if (

            index < 0 ||

            index >= this.config.rules.length

        )

            return false;

        this.config.rules.splice(

            index,

            1

        );

        return true;

    }

    save() {

        fs.writeFileSync(

            CONFIG_FILE,

            JSON.stringify(

                this.config,

                null,

                4

            )

        );

        logger.info(

            "forwarder.json saved."

        );

    }
    enableRule(index) {

        if (

            index < 0 ||

            index >= this.config.rules.length

        )

            return false;

        this.config.rules[index].enabled = true;

        return true;

    }

    disableRule(index) {

        if (

            index < 0 ||

            index >= this.config.rules.length

        )

            return false;

        this.config.rules[index].enabled = false;

        return true;

    }

    findBySource(source) {

        return this.config.rules.filter(

            rule =>

                rule.sources &&

                rule.sources.includes(source)

        );

    }

    findByTarget(target) {

        return this.config.rules.filter(

            rule =>

                rule.targets &&

                rule.targets.includes(target)

        );

    }

    stats() {

        return {

            rules: this.config.rules.length,

            enabled: this.config.rules.filter(

                r => r.enabled

            ).length

        };

    }
}

export default new Forwarder();
