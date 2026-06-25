class RuleMatcher {

    getSource(message) {

        if (message.to && message.to.endsWith("@g.us"))
            return message.to;

        if (message.from && message.from.endsWith("@g.us"))
            return message.from;

        return message.from;

    }

    findRule(config, message) {

        const source = this.getSource(message);

        for (const rule of config.rules) {

            if (!rule.enabled)
                continue;

            if (!rule.sources)
                continue;

            if (rule.sources.includes(source))
                return rule;

        }

        return null;

    }

}

export default new RuleMatcher();
