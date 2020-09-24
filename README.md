# Pixel recognition backend

This is a small demo intended to send a simple response to video messages via websocket.

## Steps

These are the steps to be executed in order to start the backend (Linux/WSL assumed).

### Build the image

~~~~
build.sh
~~~~

### Start the container

~~~~
run.sh
~~~~


### Update client endpoint

Update client settings that will be hitting against this server to point to "ws://localhost:SOCKET_PORT" (Default SOCKET_PORT value is in Dockerfile, is currently 8043)
