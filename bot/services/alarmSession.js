import logger from "../logger.js";

class AlarmSessionManager {

    constructor() {

        this.sessions = new Map();

    }

    get(source) {

        return this.sessions.get(source);

    }

    create(source) {

        let session = this.sessions.get(source);

        if (!session) {

            session = {

                source,

                messages: [],

                timer: null,

                startedAt: Date.now(),

                lastActivity: Date.now(),

                forwarding: false

            };

            this.sessions.set(source, session);

            logger.info(
                `Alarm session created -> ${source}`
            );

        }

        return session;

    }

    remove(source) {

        const session = this.sessions.get(source);

        if (!session)
            return;

        if (session.timer)
            clearTimeout(session.timer);

        this.sessions.delete(source);

    }

    resetTimer(source, seconds, callback) {

        const session = this.sessions.get(source);

        if (!session)
            return;

        if (session.timer)
            clearTimeout(session.timer);

        session.lastActivity = Date.now();

        session.timer = setTimeout(async () => {

            session.forwarding = true;

            logger.info(
                `Alarm session finished -> ${source}`
            );

            try {

                await callback(session);

            } finally {

                this.remove(source);

            }

        }, seconds * 1000);

    }

    isForwarding(source) {

        const session = this.sessions.get(source);

        if (!session)
            return false;

        return session.forwarding;

    }

}

export default new AlarmSessionManager();
