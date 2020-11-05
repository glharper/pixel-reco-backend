const port = process.env.SOCKET_PORT;
var ws = require('ws');
var fs = require('fs');
var server = new ws.Server({ port: port });
const scriptPath = process.env.SCRIPT_DIR; 
var scriptDict = {};

// Expected: <SCRIPT_DIR>/<LANGUAGE>/<TEST_SUITE>.log
function loadScripts(path) {
   fs.readdirSync(path).forEach(language => {
      const dirPath = path + '/' + language;
      if (fs.statSync(dirPath).isDirectory()) {
         scriptDict[language] = {};
         fs.readdirSync(dirPath).forEach(script => {
            var testSuite = script.substring(0, script.indexOf('.'));
            if (testSuite !== undefined & testSuite !== "") {
               scriptDict[language][testSuite] = {};
               var tests = fs.readFileSync(dirPath + '/' + script).toString().split("Test: ");
               tests.forEach(test => {
                  if (test !== undefined & test !== "") {
                     var testLines = test.split("\r\n");
                     var testName = testLines[0];
                     scriptDict[language][testSuite][testName] = testLines.slice(1); 
                  }
               });
            }
         });
      }
   });
}

loadScripts(scriptPath);
 
let requestDict = {};
server.on('connection', function connection(conn) 
{
   conn.on('message', function incoming(message) 
   { 
      const headerBodySplit = message.toString().split("\r\n");
      if (headerBodySplit && headerBodySplit.length > 0) {
         const requestId = headerBodySplit[1].split(" ")[1];
         if(!(requestId in requestDict) && headerBodySplit[0] === 'Path: speech.config' && headerBodySplit[3] ==="Content-Type: application/json") {
            let configDict = JSON.parse(headerBodySplit[5]);
            if (configDict.context.system && 'lang' in configDict.context.system && 'testSuite' in configDict.context.system && 'testName' in configDict.context.system) {
               let language = configDict.context.system['lang'];
               if(language in scriptDict) {
                  let testSuite = configDict.context.system['testSuite'];
                  if(testSuite in scriptDict[language]) {
                     let testName = configDict.context.system['testName'];
                     if(testName in scriptDict[language][testSuite]) {
                        requestDict[requestId] = { 
                           'script': scriptDict[language][testSuite][testName],
                           'index': 1,
                           'testName': testName
                        };
                     }
                  }
               }
            }
         } else {
            if (requestId in requestDict) {

               let entry = requestDict[requestId];
               let currentIndex = entry['index'];
               let messageType = entry['script'][currentIndex].split(" ")[0];

               // First check if we expect a message from client
               if (messageType === "Sent:") {
                  currentIndex += 1;
                  messageType = entry['script'][currentIndex].split(" ")[0];
               }

               // Send response(s) if script dictates
               while (messageType === "Received:") {
                  let responseMembers = entry['script'][currentIndex].split("|");
                  let responseHeaderDict = JSON.parse(responseMembers[4].slice(responseMembers[4].indexOf("{")));
                  let responseBody = JSON.parse(responseMembers[2].slice(responseMembers[2].indexOf("{")));
                  responseHeaderDict["x-requestid"] = requestId;
                  // let headers = responseMembers[4].slice(responseMembers[4].indexOf("{"), responseMembers[4].length - 1);
                  let headers = "";
                  for (var key in responseHeaderDict) {
                     if (responseHeaderDict.hasOwnProperty(key)) {
                        headers += key + ": " + responseHeaderDict[key] + "\r\n";
                     }
                  }
                  let response = `${headers}\r\n${JSON.stringify(responseBody)}`;
                  conn.send(response);
                  currentIndex += 1;
                  messageType = entry['script'][currentIndex].split(" ")[0];
               }

               // update index value in requestDict
               requestDict[requestId]['index'] = currentIndex;

               // if we've gotten to the end of the script, delete this entry in requestDict
               if ( currentIndex >= entry['script'].length || !entry['script'][currentIndex] || entry['script'][currentIndex] === '') {
                  delete requestDict[requestId];
               }
            }
            /*
            console.log('received: non-speech config message');
            const binaryMessage = Buffer.from(message)
            const headerLength = binaryMessage.readInt16BE(0);

            let headerString = "";
            for (let i = 0; i < headerLength; i++) {
                headerString += String.fromCharCode(binaryMessage.readUInt8(i + 2));
            }
            let response = "Path: turn.end\r\n";
            if(binaryMessage.length > 2 + headerLength) {
               const pixelPosition = 0;
               const body = binaryMessage.slice(2 + headerLength); 
               const pixel = body.readUInt8(pixelPosition);
               let color = (pixel < 64) ? "white" : "black";
               response = "Path: vision.color\r\n\r\n" + "color: " + color;
            }
            conn.send(response);
            */
         
         }
      }
   });

}); 

console.log('Websocket server listening at ws://localhost:' + port);


