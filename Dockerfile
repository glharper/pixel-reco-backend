FROM node:alpine

WORKDIR /apps
RUN npm install ws fs 
ADD server.js /apps/
ENV SCRIPT_DIR="/apps/scripts"
COPY scripts ${SCRIPT_DIR}
ENV SOCKET_PORT=8043

EXPOSE ${SOCKET_PORT}

ENTRYPOINT ["node", "server.js"]

