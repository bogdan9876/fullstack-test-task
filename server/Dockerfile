FROM node:18-alpine

RUN apk add --no-cache python3 make g++ 

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --production

COPY . .

RUN npm rebuild bcrypt --build-from-source

CMD ["npm", "start"]
