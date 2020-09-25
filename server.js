var port = process.env.SOCKET_PORT;
var ws = require('ws');
var server = new ws.Server({ port: port });
 
server.on('connection', function connection(conn) 
{
   conn.on('message', function incoming(message) 
   { 
      const headerBodySplit = message.toString().split("\r\n");
      if (headerBodySplit && headerBodySplit.length > 0) {
         const headerFirstWord = headerBodySplit[0].split(" ")[0];
         if(headerFirstWord === 'Path:') {
            console.log('received: header %s', headerBodySplit[0]);
         } else {
            const binaryMessage = Buffer.from(message)
            const headerLength = binaryMessage.readInt16BE(0);

            let headerString = "";
            for (let i = 0; i < headerLength; i++) {
                headerString += String.fromCharCode(binaryMessage.readUInt8(i + 2));
            }
            console.log('received: binary header length %s, content: %s', headerLength.toString(), headerString);
            let response = "Path: turn.end\r\n";
            if(binaryMessage.length > 2 + headerLength) {
               const pixelPosition = 0;
               const body = binaryMessage.slice(2 + headerLength); 
               const pixel = body.readUInt8(pixelPosition);
               let color = (pixel < 64) ? "white" : "black";
               response = "Path: vision.color\r\n\r\n" + "color: " + color;
            }
            conn.send(response);
         
         }
      }
   });

}); 

console.log('Websocket server listening at ws://localhost:' + port);


