// Node.js WebSocket server script
const http = require('http');
//const { ClientSession } = require('mongodb');
//const { client } = require('websocket');
const WebSocketServer = require('websocket').server;
const MongoClient = require('mongodb').MongoClient;
const server = http.createServer();
server.listen(9898);

var url = "mongodb://0.0.0.0:27017/";
const dbName = 'dbJeu';

const wsServer = new WebSocketServer({
  httpServer: server
});

let room={
  player1:null,
  player2:null,
  roomIdentifi:null
};
const currentConnections = [];
const gameRoomsArray = [];
let allConnections=[];

wsServer.on('request', async function (request) {
  const connection = request.accept(null, request.origin);
  //Stores every connection to the site, connected or not
  currentConnections.push(connection);
  



  //---------------------recu par client------------------------------------------------------
  connection.on('message', async function (message) {
    connection.send('coucou from serveur');
    console.log(message)
    connection.send('MessageReceived from serveur');

//---------------------verif login-----------------
    let userCreds={  login: null, password: null, status:"connected"};
    const client = new MongoClient(url);

    if(message.utf8Data.substring(0,6)==="Login_"){
      let position = message.utf8Data.indexOf("pass_");
      userCreds.login=message.utf8Data.substring(6,position)
      userCreds.pass=message.utf8Data.substring(position+5,message.utf8Data.length);
      let userExists=await foundUser(userCreds);
      if (userExists){
        console.log("user found")
        client.db(dbName).collection('connectedUsers').updateOne({login:userCreds.login,password:userCreds.pass}, { $set: { status: "connected" }});
      }
      else{
      client.db(dbName).collection('connectedUsers').insertOne({login:userCreds.login,password:userCreds.pass,status:userCreds.status});
      }
    }
    async function foundUser(userCreds){
      const collection = client.db(dbName).collection('connectedUsers'); 
      const user = await collection.findOne({ login: userCreds.login, password: userCreds.pass });
      return !!user;
    }
    //---------------------creer partie 1vs1-----------------
    let userConnection={connection: connection,username:userCreds.login}

    allConnections.push(userConnection);


    if (message.utf8Data.substring(0, 9) === "click1VS1") {
      let user1VS1 = message.utf8Data.substring(9, message.utf8Data.length);

        for (const roomId in gameRoomsArray) {
          let room={
            player1:null,
            player2:null,
            roomIdentifi:null
          };
          room = gameRoomsArray[roomId];
          console.log(gameRoomsArray)

          //1er cas : creation d'une salle d'attente vide + insertion user
      

          //2eme cas : un user deja present + inserstion d'un user
          if (room.player2 !== null && room.player1 === null  || room.player1 !== null && room.player2 === null) {
              const pl1Connection = allConnections.find((connection) => connection.username === room.player1);
              const pl2Connection = allConnections.find((connection) => connection.username === room.player2);

            if (room.player1 === null) {
              room.player1 = user1VS1;
              console.log("1VS1 Game: Player 1 (" + room.player1 + ") joined room " + roomId);
              pl1Connection.connection.send("player1")
              }
            else {
              room.player2 = user1VS1;
              console.log("1VS1 Game: Player 2 (" + room.player2 + ") joined room " + roomId);
              pl2Connection.connection.send("player2")
            }
            //apres insertion, ca verifie si les 2 sont present
            //etablie une connexion, commence le jeu

            if (room.player1 !== null && room.player2 !== null) {
              console.log("1VS1 Game started between " + room.player1 + " and " + room.player2);
              
              const player1Connection = allConnections.find((connection) => connection.username === room.player1);
              const player2Connection = allConnections.find((connection) => connection.username === room.player2);
              
              if(player1Connection && player2Connection){
              
                //const player2Connection = allConnections.find((connection) => connection.username === room.player2);

                player1Connection.connection.send("You are playing with "+ room.player2+ " in room " + room.roomIdentifi );
                player2Connection.connection.send("You are playing with "+ room.player1+ " in room " + room.roomIdentifi);
                player1Connection.connection.send("room"+room.roomIdentifi);
                player2Connection.connection.send("room"+room.roomIdentifi)
                player1Connection.connection.send("player1");
                player2Connection.connection.send("player2");

       
              } else {
                console.error("Could not find connections for players:", room.player1, room.player2);
              }
            }
          }
          break;
        }

        if (room.player1 === null && room.player2 === null) {
          // Création d'une nouvelle salle
       const roomId = generateRoomId();
       room.roomIdentifi=roomId;
       room.player1=user1VS1;
       gameRoomsArray[roomId] = { player1:user1VS1, player2:null, roomIdentifi:roomId};
       console.log(gameRoomsArray[roomId])
       console.log("1VS1 Game: Player 1 (" + room.player1 + ") created new room " + room.roomIdentifi);
       const playerConnection = allConnections.find((connection) => connection.username === room.player1);
       playerConnection.connection.send("player1");
       }
       
    }

     //--------------------Gestion des envoie des movements-----------------

     if (message.utf8Data.substring(0, 5) === "oldxy") {

      let oldPos=[];
      oldPos.push(parseInt(message.utf8Data.substring(5, 6)),parseInt(message.utf8Data.substring(7, 8)));
      console.log(oldPos)
      let roomid=message.utf8Data.substring(12, 18)
      let roomPlayed= gameRoomsArray[roomid]

      let identifyPlayer2=message.utf8Data.substring(message.utf8Data.length-1, message.utf8Data.length)
      console.log(identifyPlayer2)
      
      const p1Conn = allConnections.find((connection) => connection.username === roomPlayed.player1);
      const p2Conn = allConnections.find((connection) => connection.username === roomPlayed.player2);
      if (identifyPlayer2==="1"){
        p1Conn.connection.send("old"+oldPos)
        console.log(oldPos)
      }
      if (identifyPlayer2==="0"){
        p2Conn.connection.send("old"+oldPos)
        console.log(oldPos)
      }

    }

    if (message.utf8Data.substring(0, 5) === "newxy") {
      let newPos=[];
      newPos.push(parseInt(message.utf8Data.substring(5, 6)),parseInt(message.utf8Data.substring(7, 8)));
      console.log(newPos)

      let roomid=message.utf8Data.substring(12, 18)
      //console.log(roomid)
      let roomPlayed= gameRoomsArray[roomid]
      //console.log(roomPlayed)
      let identifyPlayer2=message.utf8Data.substring(message.utf8Data.length-1, message.utf8Data.length)
      console.log(identifyPlayer2)

      const p1Conn = allConnections.find((connection) => connection.username === roomPlayed.player1);
      const p2Conn = allConnections.find((connection) => connection.username === roomPlayed.player2);
      if (identifyPlayer2==="1"){
        p1Conn.connection.send("new"+newPos)
        console.log(newPos)
      }
      if (identifyPlayer2==="0"){
        p2Conn.connection.send("new"+newPos)
        console.log(newPos)
      }
    }
    



    


  });
//-----------------connexion fermé-------------------------------------------------------------------------
  connection.on('close', function (reasonCode, description) { console.log('Client has disconnected.');});
//--------------fin request--------------------------------------------------------------------------------------
});


function generateRoomId() {
  return Math.random().toString(36).substring(2, 8);
}







console.log("listening on port 9898");









