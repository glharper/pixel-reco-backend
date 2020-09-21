var port = process.env.SOCKET_PORT;
var ws = require('ws');
var server = new ws.Server({ port: port });
 
server.on('connection', function connection(conn) 
{
   conn.on('message', function incoming(message) 
   {
      console.log('received: %s', message);
   });

   var response = {};
 
   conn.send(response.toString());
}); 

console.log('Websocket server listening at ws://localhost:' + port);


