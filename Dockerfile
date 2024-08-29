FROM node:20.10.0-alpine

WORKDIR /usr/src/app


COPY package*.json ./
COPY prisma ./prisma

RUN npm install

COPY . .

RUN npm run build

RUN npx prisma generate


EXPOSE 3000

CMD ["node", "build/server.js"]