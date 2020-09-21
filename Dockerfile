FROM node:alpine

WORKDIR /apps
RUN npm install ws node-static
ADD index.html /apps/
ADD server.js /apps/
ENV SOCKET_PORT=8043

EXPOSE ${SOCKET_PORT}

ENTRYPOINT ["node", "server.js"]

