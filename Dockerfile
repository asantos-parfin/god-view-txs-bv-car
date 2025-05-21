FROM node:slim

WORKDIR /app

# npm install
COPY package*.json .
RUN npm install

# copy app
COPY . .

# start
CMD ["npm", "run", "start"]