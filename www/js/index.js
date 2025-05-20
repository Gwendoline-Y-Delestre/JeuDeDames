import Damier from './model/Damier.js';
import Game from './model/Game.js';
import Pion from './model/Pion.js';
import GameOrdi from './model/GameOrdi.js';
import GameOnline from './model/GameOnline.js';
export { receivedoldXY };
export { receivedNewXY };
export { roomid };
export { player1_s };
export { player2_s };




// Cordova is now initialized. Have fun!

// Create the Web socket !
const wsClient = new WebSocket('ws://localhost:9898/');
let loginCred = null;
let passCred = null;
let roomid = null, player1_s = null, player2_s = null;
let receivedoldXY = [], receivedNewXY = [];
let gameOnline;

document.getElementById("seConnecter").addEventListener("click", () => {
  loginCred = document.getElementById("Login").value;
  passCred = document.getElementById("MDP").value;
  wsClient.send("Login_" + loginCred + "pass_" + passCred);
  console.log("Envoyer les credentials");
});




wsClient.onopen = function (e) {
  console.log("WebSocket Client Connected");
  wsClient.send("Hi this is web client.");
};

wsClient.onmessage = function (e) {
  console.log("Received: '" + e.data + "'");
  if (e.data.substring(0, 4) === "room") {
    roomid = e.data.substring(0, e.data.length)
    console.log(roomid);

  }
  if (e.data.substring(0, 7) === "player1") {
    player1_s = "1";
    player2_s = "0";
    console.log(player1_s, player2_s);
  }
  if (e.data.substring(0, 7) === "player2") {
    player1_s = "0";
    player2_s = "1";
    console.log(player1_s, player2_s);
  }
  if (e.data.substring(0, 3) === "old") {
    console.log(e.data + "coucouold");
    receivedoldXY = [parseInt(e.data.substring(3, 4)), parseInt(e.data.substring(5, 6))]
    console.log("receivedOldXV :" + receivedoldXY);
  }
  if (e.data.substring(0, 3) === "new") {
    console.log(e.data + "coucounew");
    receivedNewXY = [parseInt(e.data.substring(3, 4)), parseInt(e.data.substring(5, 6))]
    console.log("receivedNewXV :" + receivedNewXY);
    gameOnline.newTurnAdvers();
  }



};

wsClient.onclose = function (e) {
  console.log("Lost a client");
}


//

//event listeners pour commencer les parties
document.getElementById("solo").onclick = partieSolo
document.getElementById("online").onclick = partieOnline
document.getElementById("ia").onclick = partieIA;
document.getElementById("abandon").onclick = abandon;
document.getElementById("rejouer").onclick = rePlay;



//les fonctions pour lancer les parties
function partieSolo() {
  const largeurEcran = window.innerWidth;
  const hauteurEcran = window.innerHeight;

  // Choisissez la plus petite dimension comme taille du damier
  const tailleDamier = Math.min(largeurEcran, hauteurEcran);

  // Demandez à l'utilisateur le nombre de cases par ligne
  //const casesParLigne = parseInt(prompt('Entrez le nombre de cases par ligne :'), 10);
  const casesParLigne = 8;

  if (isNaN(casesParLigne) || casesParLigne <= 7) {
    alert(
      "Le nombre de lignes doit être un nombre entier supérieur ou égal à 7."
    );
  } else {
    const tailleCase = (tailleDamier / casesParLigne) * 0.9;
    const game = new Game(casesParLigne, tailleCase);
    game.createGrid();
  }
  // var prompt = document.getElementById("customPrompt");
  // prompt.hidden = false;
  var jeu = document.getElementById("game");
  jeu.hidden = false;
  var menu = document.getElementById("menu");
  menu.hidden = true;
}


function partieOnline() {
  wsClient.send("click1VS1" + loginCred);
  const largeurEcran = window.innerWidth;
  const hauteurEcran = window.innerHeight;

  // Choisissez la plus petite dimension comme taille du damier
  const tailleDamier = Math.min(largeurEcran, hauteurEcran);


  // Demandez à l'utilisateur le nombre de cases par ligne
  //const casesParLigne = parseInt(prompt('Entrez le nombre de cases par ligne :'), 10);
  const casesParLigne = 8;

  if (isNaN(casesParLigne) || casesParLigne <= 7) {
    alert(
      "Le nombre de lignes doit être un nombre entier supérieur ou égal à 7."
    );
  } else {

    const tailleCase = (tailleDamier / casesParLigne) * 0.9;

    // Use a promise to wait for player information
    const waitForPlayerInfo = new Promise((resolve, reject) => {
      const checkPlayerInfo = () => {
        if (player1_s !== null && player2_s !== null) {
          resolve();
        } else {
          setTimeout(checkPlayerInfo, 100);
        }
      };
      checkPlayerInfo();
    });

    // Wait for player information before creating the grid
    waitForPlayerInfo.then(() => {
      if (player1_s === "1" && player2_s === "0") {
        gameOnline = new GameOnline(casesParLigne, tailleCase);
        gameOnline.createGridJ1();
        console.log("Player 1 grid created");
      }
      if (player1_s === "0" && player2_s === "1") {
        gameOnline = new GameOnline(casesParLigne, tailleCase);
        gameOnline.createGridJ2();
        console.log("Player 2 grid created");
      }

      var jeu = document.getElementById("game");
      jeu.hidden = false;
      var menu = document.getElementById("menu");
      menu.hidden = true;

    });
  }
}

function partieIA() {
  const largeurEcran = window.innerWidth;
  const hauteurEcran = window.innerHeight;

  // Choisissez la plus petite dimension comme taille du damier
  const tailleDamier = Math.min(largeurEcran, hauteurEcran);

  // Demandez à l'utilisateur le nombre de cases par ligne
  // const casesParLigne = parseInt(prompt('Entrez le nombre de cases par ligne :'), 10);
  const casesParLigne = 8;

  if (isNaN(casesParLigne) || casesParLigne <= 7) {
    alert(
      "Le nombre de lignes doit être un nombre entier supérieur ou égal à 7."
    );
  } else {
    const tailleCase = (tailleDamier / casesParLigne) * 0.9;
    // const game = new Game(casesParLigne, tailleCase);
    const game = new GameOrdi(casesParLigne, tailleCase);
    game.createGrid();
  }
  var jeu = document.getElementById("game");
  jeu.hidden = false;
  var menu = document.getElementById("menu");
  menu.hidden = true;
}


function abandon() {
  var svgElement = document.getElementById("grille");
  svgElement.innerHTML = "";

  var jeu = document.getElementById("game");
  jeu.hidden = true;

  var menu = document.getElementById("menu");
  menu.hidden = false;
}


function rePlay() {
  var svgElement = document.getElementById("grille");
  svgElement.innerHTML = "";

  const div = document.getElementById("endGame");
  div.hidden = true;
  const message1 = document.getElementById("perdu");
  message1.hidden = true;
  const message2 = document.getElementById("gagne");
  message2.hidden = true;

  var jeu = document.getElementById("game");
  jeu.hidden = false;

  const largeurEcran = window.innerWidth;
  const hauteurEcran = window.innerHeight;

  // Choisissez la plus petite dimension comme taille du damier
  const tailleDamier = Math.min(largeurEcran, hauteurEcran);

  // Demandez à l'utilisateur le nombre de cases par ligne
  // const casesParLigne = parseInt(prompt('Entrez le nombre de cases par ligne :'), 10);
  const casesParLigne = 8;

  if (isNaN(casesParLigne) || casesParLigne <= 7) {
    alert(
      "Le nombre de lignes doit être un nombre entier supérieur ou égal à 7."
    );
  } else {
    const tailleCase = (tailleDamier / casesParLigne) * 0.9;
    // const game = new Game(casesParLigne, tailleCase);
    const game = new GameOrdi(casesParLigne, tailleCase);
    game.createGrid();
  }
}


//document.addEventListener('deviceready', onDeviceReady, false);

//onDeviceReady();



