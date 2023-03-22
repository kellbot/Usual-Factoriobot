FROM node:16

WORKDIR /usr/src/Usual-Factoriobot

COPY package*.json ./
RUN npm install

COPY . .

CMD [ "node", "deploy-commands.js" ]
CMD [ "node", "main.js" ]
