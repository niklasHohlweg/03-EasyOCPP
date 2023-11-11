const { Socket } = require('dgram');
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const uuid = require('node-uuid');
const { default: mongoose, now } = require('mongoose');
const ip = require("ip");
const cors = require('cors');

console.log(`IP-Adress: ${ip.address()}`);

//Connection Ports
const httpPort = process.env.HTTP_Port || 3000;
const wsPort = process.env.WS_Port || 8080;

//Database
var chargeLogs = require('./db');
const dbUrl = process.env.db;
mongoose.connect(dbUrl);
console.log("Database Connected");

//Create App
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ port: wsPort });
console.log(`WebSocket-Server is running on Port ${wsPort}`);

var clients = [];
var count = 0;



//WebSocket-Schnittstelle
wss.on('connection', (ws) => {

    console.log('New connection established');

    var client_uuid = uuid.v4();
    clients.push({
        "id": client_uuid,
        "ws": ws,
    })
    console.log(`Client ${client_uuid} is connected to the System`)


    ws.on('message', (message) => {
        
        console.log(" ");
        console.log('# # # # # # # # # # # # # # # # # # #  NEW MESSAGE  # # # # # # # # # # # # # # # # # # #')

        console.log(`CP message: ${message}`);
        var clientMessage = JSON.parse(message);
        
        reply = generateReply(clientMessage);

        clients[0].ws.send(JSON.stringify(reply));
        console.log(`Sent from Backend to CP: ${reply}`);
        console.log('TimeStamp: ', Date());

        dbRun(clientMessage[0],  clientMessage[1], clientMessage[2], clientMessage[3]);

        count += 1;
        console.log(`OCPP-Message count is ${count}`)


    });

    ws.on('error', (params) => {

        console.error('Error: ', params);

    })

    ws.on('close', () => {

        console.log('Connection has been closed...');
        
        //Bereinigung und Status der Ladestation aktualisieren

    });
});




//HTTP-Events
app.use('/public', express.static(__dirname + '\\frontend\\public'));
app.use(cors())

app.get("/", (req, res) => {

    res.send(`Bitte Benutze ${ip.address()}:${httpPort}/hohlweg`);
    console.log(req);

})

app.get('/dev', (req, res) => {

    res.send('HTTP DEV-Port (Access denied)');
    console.log(req);

});

app.get('/hohlweg', (req, res) => {

    res.sendFile(__dirname + '\\frontend\\index.html')
    console.log(req);

});

app.get('/adm/data', async (req, res) => {

    //const data = getData();
    const data1 = await chargeLogs.find();

    let collection = [];
    let dataElem = {
        MessageTypeId: Number,
        UniqueId: String,
        Action: String,
        Timestamp: String,
        Payload: Object
    }

    data1.forEach(element => {

        collection.push(
            {
                MessageTypeId: element.MessageTypeId,
                UniqueId: element.UniqueId,
                Action: element.Action,
                Timestamp: element.Timestamp,
                Payload: element.Payload
            }
        );
        
    });
    
    res.send(JSON.stringify(collection));

})


//Launch HTTP-Server
server.listen(httpPort, () => {

    console.log(`HTTP-Server is running on Port ${httpPort}`);

});



//CP Reply-Function
function generateReply(message) {

    switch(message[2]){

        case "BootNotification":
            console.log("BootNotification reply...");
            return [3, message[1], { "status": "Accepted", "currentTime": new Date().toISOString(), "interval": 60 }];

        case "StartTransaction":
            console.log("StartTransaction reply...");
            return [3, message[1], { "status": "Accepted" }];

        case "Heartbeat":
            console.log("Heartbeat reply...");
            return [3, message[1], { "currentTime": new Date().toISOString() }];

        case "StatusNotification":
            console.log("StatusNotification reply...");
            return [3, message[1], {}];
            
        case "MeterValues":
            console.log("MeterValues reply...");
            return [3, message[1], {}];
            
        case "Authorize":
            console.log("Authorize reply...");
            return [3, message[1], { idTagInfo: { "status": "Accepted" } }];

    }

}

//Database Connection
async function dbRun(typeId, uniqueId, action, payload) {

    try {
        const log = await chargeLogs.create({
                MessageTypeId: typeId,
                UniqueId: uniqueId,
                Action: action,
                Payload: payload,
                Timestamp: now()
        })

        console.log("Sent to DB: ", log);

    }
    catch (err) {

        console.error(err.message);

    }
    

}

async function getData() {

    try {
        const filter = {};
        const data = await chargeLogs.find(filter);
                
        return data;
    }
    catch(err) {
        console.error(err.message);
    }

}