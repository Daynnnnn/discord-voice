FROM node:12
WORKDIR /src

ADD /package.json /src
RUN npm install

ADD / /src
CMD ["node", "index.js"]