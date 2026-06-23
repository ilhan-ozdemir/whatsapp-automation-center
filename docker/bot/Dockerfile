FROM node:22-bookworm

WORKDIR /app

ENV PUPPETEER_SKIP_DOWNLOAD=true

RUN apt-get update && \
    apt-get install -y \
        git \
        curl \
        wget \
        ca-certificates \
        dumb-init \
        chromium \
        build-essential \
        python3 && \
    rm -rf /var/lib/apt/lists/*

COPY bot/package*.json ./

RUN npm install

ENTRYPOINT ["/usr/bin/dumb-init","--"]

CMD ["npm","start"]
