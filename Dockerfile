FROM node:16

ARG USER=factorio
ARG GROUP=factorio
ARG PUID=845
ARG PGID=845

WORKDIR /opt/Factoriobot

COPY package*.json ./
RUN npm install \
    && adduser --uid "$PUID" --shell /bin/sh "$USER" \
    && chown -R "$USER":"$GROUP" /opt/Factoriobot

VOLUME /opt/Factoriobot/data


COPY . .

CMD [ "node", "deploy-commands.js" ]
CMD [ "node", "main.js" ]
