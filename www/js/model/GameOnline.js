import Dame from './Dame.js';
import Pion from './Pion.js';
import Damier from './Damier.js';
import { roomid } from './../index.js';
import { player1_s } from './../index.js';
import { player2_s } from './../index.js';
import { receivedoldXY } from './../index.js';
import { receivedNewXY } from './../index.js';

const wsClient = new WebSocket('ws://localhost:9898/');



export default class Game {

  constructor(casesParLigne, tailleCase) {
    this.player1Score = 0; //white
    this.player2Score = 0; //black
    this.currentPlayer = "white";
    this.casesParLigne = casesParLigne;
    this.tailleCase = tailleCase;
    /**
     * tableau des cases sélectionnées ([0]=la case cliquée, [0<]=les cases de destination)
     */
    this.caseSelect = [];
    /**
     * tableau des pions avec event (cercles svg)
     */
    this.eventedPions = [];
    /**
     * tableau des pions blancs (cercles svg)
     */
    this.whitePions = [];
    /**
     * tableau des pions noirs (cercles svg)
     */
    this.blackPions = [];
    /**
     * booléen pour savoir si un événement a été utilisé
     */
    this.eventUsed = false;
    /**
     * Le joueur de la session (blanc ou noir)
     */
    this.sessionPlayer;
    /**
     * Tableau des coordonnées x et y du pion AVANT le déplacement (pour l'envoie au serveur)
     */
    this.oldXY = [];
    /**
     * Tableau des coordonnées x et y du pion APRES le déplacement (pour l'envoie au serveur)
     */
    this.newXY = [];

    this.damierObjet;
  }

  /**
   * Crée le damier SVG et ajoute les événements aux pions blancs
   */
  createGridJ1() {
    this.sessionPlayer = "white";
    const svg = document.getElementById('grille');
    // Création du damier du modèle
    const damier = new Damier(this.casesParLigne);
    // Création du damier SVG
    const svgWidth = this.casesParLigne * this.tailleCase;
    const svgHeight = this.casesParLigne * this.tailleCase;
    svg.setAttribute("width", svgWidth);
    svg.setAttribute("height", svgHeight);
    for (let i = 0; i < this.casesParLigne; i++) {
      for (let j = 0; j < this.casesParLigne; j++) {
        const caseCourante = damier.getCase(i, j);
        const pion = caseCourante.getPion();
        // Création de la case
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", j * this.tailleCase);
        rect.setAttribute("y", i * this.tailleCase);
        rect.setAttribute("width", this.tailleCase);
        rect.setAttribute("height", this.tailleCase);
        rect.setAttribute("fill", caseCourante.getCouleur());
        const rectId = `rect-${i}-${j}`;
        rect.setAttribute("id", rectId);
        svg.appendChild(rect);
        // Création du pion
        if (pion !== null) {
          const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          circle.setAttribute("cx", j * this.tailleCase + this.tailleCase / 2);
          circle.setAttribute("cy", i * this.tailleCase + this.tailleCase / 2);
          circle.setAttribute("r", (this.tailleCase / 2) * 0.9);
          circle.setAttribute("fill", pion.getCouleur());
          const circleId = `circle-${i}-${j}`;
          circle.setAttribute("id", circleId);
          if (pion.getCouleur() === "black") {
            circle.setAttribute("stroke", "white");
            circle.setAttribute("stroke-width", 2);
            this.blackPions.push(circle);
          }
          if (pion.getCouleur() === "white") {
            this.whitePions.push(circle);
          }
          // Ajout de l'event listener sur les pions blancs
          if (caseCourante.getCouleur() === "black" && pion.getCouleur() === "white") {
            this.eventedPions = this.whitePions;
            circle.addEventListener("click", () => {
              this.resetCaseColors(this.caseSelect);
              rect.setAttribute("fill", "blue");
              this.caseSelect = [rect];
              // Affiche les choix de déplacement
              pion.moveChoice(damier).forEach((coord) => {
                const x = coord[0];
                const y = coord[1];
                const caseChoice = this.getCaseSVG(x, y);
                caseChoice.setAttribute("fill", "green");
                this.caseSelect.push(caseChoice);
                // Ajout de l'event listener pour le choix de déplacement
                caseChoice.addEventListener("click", () => {
                  this.resetCaseColors(this.caseSelect);
                  let movedPion;
                  if (pion instanceof Pion) {
                    movedPion = this.movePionSVG(pion, x, y);
                  }
                  else {
                    movedPion = this.moveDameSVG(pion, x, y);
                  }

                  pion.move(damier, x, y);
                  this.removeEventsPion(movedPion[0], 1);
                  this.removeEventsCase();

                  //////////////////////////////////////////////////////////////////
                  //TODO : envoie du mouvement au serveur
                  console.log("Envoie du mouvement au serveur :")

                  wsClient.send("oldxy" + this.oldXY + roomid + player1_s + player2_s);
                  wsClient.send("newxy" + this.newXY + roomid + player1_s + player2_s);

                  //console.log("Sent sent")
                  //this.oldXY = coordonnées x et y du pion avant le déplacement
                  //this.newXY = coordonnées x et y du pion après le déplacement
                  //////////////////////////////////////////////////////////////////

                  //NOUVEAU TOUR ADVERSAIRE
                  //this.newTurnAdvers(damier);
                  this.damierObjet = damier;
                });
              });
            });
          }
          svg.appendChild(circle);

        }
      }
    }
  }

  /**
   * Crée le damier SVG et sans événements pour le joueur 2 (noir)
   */
  createGridJ2() {
    this.sessionPlayer = "black";
    this.currentPlayer = "black";
    const svg = document.getElementById('grille');
    // Création du damier du modèle
    const damier = new Damier(this.casesParLigne);
    // Création du damier SVG
    const svgWidth = this.casesParLigne * this.tailleCase;
    const svgHeight = this.casesParLigne * this.tailleCase;
    svg.setAttribute("width", svgWidth);
    svg.setAttribute("height", svgHeight);
    for (let i = 0; i < this.casesParLigne; i++) {
      for (let j = 0; j < this.casesParLigne; j++) {
        const caseCourante = damier.getCase(i, j);
        const pion = caseCourante.getPion();
        // Création de la case
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", j * this.tailleCase);
        rect.setAttribute("y", i * this.tailleCase);
        rect.setAttribute("width", this.tailleCase);
        rect.setAttribute("height", this.tailleCase);
        rect.setAttribute("fill", caseCourante.getCouleur());
        const rectId = `rect-${i}-${j}`;
        rect.setAttribute("id", rectId);
        svg.appendChild(rect);
        // Création du pion
        if (pion !== null) {
          const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          circle.setAttribute("cx", j * this.tailleCase + this.tailleCase / 2);
          circle.setAttribute("cy", i * this.tailleCase + this.tailleCase / 2);
          circle.setAttribute("r", (this.tailleCase / 2) * 0.9);
          circle.setAttribute("fill", pion.getCouleur());
          const circleId = `circle-${i}-${j}`;
          circle.setAttribute("id", circleId);
          if (pion.getCouleur() === "black") {
            circle.setAttribute("stroke", "white");
            circle.setAttribute("stroke-width", 2);
            this.blackPions.push(circle);
          }
          if (pion.getCouleur() === "white") {
            this.whitePions.push(circle);
          }
          svg.appendChild(circle);
        }
      }
    }
    //Attendre que le serveur envoie le mouvement de l'adversaire

    //this.newTurnAdvers(damier);
    this.damierObjet = damier;

  }


  /**
   * 
   * Attend jusqu'a ce que le serveur envoie le mouvement de l'adversaire,
   * puis applique les mouvements donnés par le serveur
   * @param {Damier} damierObj 
   */
  newTurnAdvers() {

    console.log("Mouvement adversaire");
    this.currentPlayer = this.currentPlayer === "white" ? "black" : "white";
    this.updateCurrentPlayer();

    let oldXY = [];
    let newXY = [];


    //if (!receivedNewXY && !receivedoldXY) {
    oldXY.push(receivedoldXY)
    newXY.push(receivedNewXY)
    //}

    //oldXY.push(receivedoldXY);
    console.log(oldXY)
    //newXY.push(receivedNewXY);
    console.log(newXY)

    //////////////////////////////////////////////////////////////////////////////
    //TODO : attendre jusqua ce que le server envoie le move de l'adversaire, puis applique le move
    //oldXY = coordonnées x et y du pion avant le déplacement
    //newXY = coordonnées x et y du pion après le déplacement
    //////////////////////////////////////////////////////////////////////////////


    for (let i = 0; i < oldXY.length; i++) {
      let pion = this.damierObjet.getCase(oldXY[i][0], oldXY[i][1]).getPion();
      console.log(pion)
      let newX = newXY[i][0];
      let newY = newXY[i][1];
      // Effectuez le déplacement graphique et dans le modèle
      let moveResult;

      if (pion instanceof Pion) {
        moveResult = this.movePionSVG(pion, newX, newY);

      }
      else {
        moveResult = this.moveDameSVG(pion, newX, newY);
      }
      let newDamierObj = pion.move(this.damierObjet, newX, newY, moveResult[2]);

      // MAJ de this.blackPions
      if (this.currentPlayer === "white") {
        for (let i = 0; i < this.whitePions.length; i++) {
          if (this.whitePions[i] === pion) {
            this.whitePions.splice(i, 1);
          }
        }
        this.whitePions.push(this.getPionSVG(newX, newY));
      }
      else {
        for (let i = 0; i < this.blackPions.length; i++) {
          if (this.blackPions[i] === pion) {
            this.blackPions.splice(i, 1);
          }
        }
        this.blackPions.push(this.getPionSVG(newX, newY));
      }
    }

    //NOUVEAU TOUR JOUEUR COURANT
    this.newTurn(this.damierObjet);
  }


  /**
   * Démarre un nouveau tour du joureur courant:
   * - change le joueur courant
   * - ajoute les événements aux pions de la couleur du joueur courant
   * @param {Damier} damierObj 
   */
  newTurn(damierObj) {

    //! Remise à zéro des tableaux pour l'envoie au serveur
    this.oldXY = [];
    this.newXY = [];

    //TODO : si le joueur ne peut pas jouer il perd (otpionnel)
    if (this.blackPions.length === 0) {
      setTimeout(function () {
        //  alert("Le joueur blanc a gagné !"); 
        const jeu = document.getElementById("game")
        jeu.hidden = true
        const div = document.getElementById("endGame")
        div.hidden = false
        const message = document.getElementById("gagne")
        message.hidden = false
      }, 100);
      //TODO : afficher le score et retour au menu
    }
    if (this.whitePions.length === 0) {
      setTimeout(function () {
        //  alert("Le joueur noir a gagné !"); 
        const jeu = document.getElementById("game")
        jeu.hidden = true
        const div = document.getElementById("endGame")
        div.hidden = false
        const message = document.getElementById("perdu")
        message.hidden = false
      }, 100);
      //TODO : afficher le score et retour au menu
    }
    // Change le joueur courant
    this.currentPlayer = this.currentPlayer === "white" ? "black" : "white";
    console.log("Nouveau tour " + this.currentPlayer);
    this.updateCurrentPlayer();
    // Sélectionne les pions de la couleur du joueur courant
    this.eventedPions = this.currentPlayer === "white" ? this.whitePions : this.blackPions;
    console.log(this.eventedPions)
    // Ajoute les événements aux pions de la couleur du joueur courant
    this.eventedPions.forEach(circle => {
      const cx = parseFloat(circle.getAttribute("cx"));
      const cy = parseFloat(circle.getAttribute("cy"));
      const x = Math.floor(cy / this.tailleCase);  // Utilise Math.floor pour obtenir l'indice entier de la ligne
      const y = Math.floor(cx / this.tailleCase);  // Utilise Math.floor pour obtenir l'indice entier de la colonne
      const caseCourante = damierObj.getCase(x, y);
      if (caseCourante) {
        const pion = caseCourante.getPion();
        if (pion && pion.getCouleur() === this.currentPlayer) {
          circle.addEventListener("click", () => {
            // Remettre les cases en noir
            this.resetCaseColors(this.caseSelect);
            // Changer la couleur de la case en bleu
            const caseClicked = this.getCaseSVG(x, y);
            caseClicked.setAttribute("fill", "blue");
            this.caseSelect = [caseClicked];
            // Changer la couleur des cases de destination en vert
            pion.moveChoice(damierObj).forEach((coord) => {
              const x = coord[0];
              const y = coord[1];
              const caseChoice = this.getCaseSVG(x, y);
              caseChoice.setAttribute("fill", "green");
              this.caseSelect.push(caseChoice);
              // Ajout de l'event listener pour le déplacement
              caseChoice.addEventListener("click", () => {
                this.resetCaseColors(this.caseSelect);
                let moveResult;
                if (pion instanceof Pion) {
                  moveResult = this.movePionSVG(pion, x, y);
                }
                else {
                  moveResult = this.moveDameSVG(pion, x, y);
                }
                let newDamierObj = pion.move(damierObj, x, y, moveResult[2]);
                this.removeEventsPion(moveResult[0], 1);
                this.removeEventsCase();
                // Si le pion a mangé un adversaire
                if (moveResult[1] !== null) {
                  if (pion instanceof Pion) {
                    this.moveAgain(damierObj, pion, x, y, moveResult[1]);
                  }
                  else {
                    this.moveAgain(newDamierObj, pion, x, y, moveResult[1]);
                  }
                }
                // Si aucun choix de mouvement n'est disponible
                else {
                  //Transforme le pion en Dame si besoin
                  if (pion.getCouleur() === "black") {
                    if (x == damierObj.damier.length - 1 && pion instanceof Pion) {
                      pion.transformInDame(damierObj.damier);
                      this.transformDameSVG(this.getPionSVG(pion.getCoordonnee().getX(), pion.getCoordonnee().getY()));
                    }
                  }
                  else {
                    if (x == 0 && pion instanceof Pion) {
                      pion.transformInDame(damierObj.damier);
                      this.transformDameSVG(this.getPionSVG(pion.getCoordonnee().getX(), pion.getCoordonnee().getY()));
                    }
                  }
                  //NOUVEAU TOUR
                  //////////////////////////////////////////////////////////////////
                  //TODO : envoie du mouvement au serveur 
                  console.log("Envoie du mouvement au serveur :")
                  console.log(this.oldXY);
                  console.log(this.newXY);
                  wsClient.send("oldxy" + this.oldXY + roomid + player1_s + player2_s);
                  wsClient.send("newxy" + this.newXY + roomid + player1_s + player2_s);

                  //this.oldXY = coordonnées x et y du pion avant le déplacement
                  //this.newXY = coordonnées x et y du pion après le déplacement
                  //////////////////////////////////////////////////////////////////
                  //this.newTurnAdvers(damierObj);
                  this.damierObjet = damierObj;
                }
              });
            });
          });
        }
      }
    });
  }


  /**
   * Permet à un pion de rejouer
   * @param {Damier} damierObj 
   * @param {Pion} pion 
   * @param {int} x 
   * @param {int} y 
   */
  moveAgain(damierObj, pion, x, y) {
    let eatChoices = [];
    if (pion instanceof Pion) {
      eatChoices = pion.eatChoice(damierObj);
    }
    else {
      pion.eatChoice(damierObj,
        [pion.addMovesInDirection(damierObj.damier, x, y, 1, 1),
        pion.addMovesInDirection(damierObj.damier, x, y, 1, -1),
        pion.addMovesInDirection(damierObj.damier, x, y, -1, 1),
        pion.addMovesInDirection(damierObj.damier, x, y, -1, -1)]).forEach(eat => {
          eatChoices.push(eat[0]);
        });
    }
    // Vérifie s'il y a des choix de mouvement disponibles
    if (eatChoices.length > 0) {
      this.eventUsed = false;
      this.resetCaseColors(this.caseSelect);
      const caseClicked = this.getCaseSVG(x, y);
      caseClicked.setAttribute("fill", "blue");
      this.caseSelect = [caseClicked];
      // Changer la couleur des cases de destination en vert
      eatChoices.forEach((coord) => {
        const x = coord[0];
        const y = coord[1];
        const caseChoice = this.getCaseSVG(x, y);
        caseChoice.setAttribute("fill", "green");
        this.caseSelect.push(caseChoice);
        // Ajout de l'event listener pour le déplacement
        caseChoice.addEventListener("click", () => {
          this.resetCaseColors(this.caseSelect);
          let movedPion;
          if (pion instanceof Pion) {
            movedPion = this.movePionSVG(pion, x, y);
          }
          else {
            movedPion = this.moveDameSVG(pion, x, y);
          }
          let newDamierObj = pion.move(damierObj, x, y, movedPion[2]);
          this.removeEventsPion(movedPion[0], 0);
          this.removeEventsCase();
          this.eventUsed = true;
          //appel récursif
          if (pion instanceof Pion) {
            this.moveAgain(damierObj, pion, x, y);
          }
          else {
            this.moveAgain(newDamierObj, pion, x, y);
          }
        });
      });
    }
    // Si aucun choix de mouvement n'est disponible
    else {
      //Transforme le pion en Dame si besoin
      if (pion.getCouleur() === "black") {
        if (x == damierObj.damier.length - 1 && pion instanceof Pion) {
          pion.transformInDame(damierObj.damier);
          this.transformDameSVG(this.getPionSVG(pion.getCoordonnee().getX(), pion.getCoordonnee().getY()));
        }
      }
      else {
        if (x == 0 && pion instanceof Pion) {
          pion.transformInDame(damierObj.damier);
          this.transformDameSVG(this.getPionSVG(pion.getCoordonnee().getX(), pion.getCoordonnee().getY()));
        }
      }
      //NOUVEAU TOUR
      console.log("Envoie du mouvement au serveur :")
      console.log(this.oldXY);
      console.log(this.newXY);
      wsClient.send("oldxy" + this.oldXY + roomid + player1_s + player2_s);
      wsClient.send("newxy" + this.newXY + roomid + player1_s + player2_s);
      //this.newTurnAdvers(damierObj);
      this.damierObjet = damierObj;
    }
  }

  /**
   * Déplace un pion sur le damier SVG 
   * @param {Pion} pion 
   * @param {int} x 
   * @param {int} y
   * @returns {Array} un tableau : [nouveau cercle , cercle mangé]
   */
  movePionSVG(pion, x, y) {
    //! MAJ des tableaux pour l'envoie au serveur
    console.log(this.currentPlayer)
    console.log(this.sessionPlayer)
    if (this.currentPlayer === "white" && this.sessionPlayer === "white" || this.currentPlayer === "black" && this.sessionPlayer === "black") {
      this.oldXY.push([pion.getCoordonnee().getX(), pion.getCoordonnee().getY()]);
      this.newXY.push([x, y]);
      console.log(this.oldXY)
      console.log(this.newXY)
    }
    //Si pion est un PION
    const parentSvg = document.getElementById('grille');
    let eatenCircle = null;
    // Supprime le cercle du pion original
    const circleToRemove = this.getPionSVG(pion.getCoordonnee().getX(), pion.getCoordonnee().getY());
    const crownToRemove = this.getPionSVG(pion.getCoordonnee().getX(), pion.getCoordonnee().getY() + "_text");
    if (circleToRemove) {
      parentSvg.removeChild(circleToRemove);
      this.eventedPions = this.eventedPions.filter(circle => circle !== circleToRemove);
      if (crownToRemove) {
        parentSvg.removeChild(crownToRemove);
      }
    }
    // Si le pion a mangé un adversaire, trouve les coordonnées de la case intermédiaire
    if (Math.abs(x - pion.getCoordonnee().getX()) === 2 && Math.abs(y - pion.getCoordonnee().getY()) === 2) {
      let eatenX = (x + pion.getCoordonnee().getX()) / 2;
      let eatenY = (y + pion.getCoordonnee().getY()) / 2;
      // Supprime le cercle du pion adverse de la case intermédiaire
      eatenCircle = this.getPionSVG(eatenX, eatenY);
      if (eatenCircle !== null) {
        console.log("Pion mangé en " + eatenX + " " + eatenY);
        parentSvg.removeChild(eatenCircle);
        if (document.getElementById(eatenCircle.getAttribute("id") + "_text")) {
          parentSvg.removeChild(document.getElementById("circle-" + eatenX + "-" + eatenY + "_text"));
        }
        this.eventedPions = this.eventedPions.filter(circle => circle !== eatenCircle);
        if (this.currentPlayer === "white") {
          this.player1Score++;
          this.blackPions = this.blackPions.filter(circle => circle !== eatenCircle);
        } else {
          this.player2Score++;
          this.whitePions = this.whitePions.filter(circle => circle !== eatenCircle);
        }
        this.updateScores();
      }
    }
    // Ajoute un nouveau cercle sur la case cliquée
    const newCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    newCircle.setAttribute("cx", y * this.tailleCase + this.tailleCase / 2);
    newCircle.setAttribute("cy", x * this.tailleCase + this.tailleCase / 2);
    newCircle.setAttribute("r", (this.tailleCase / 2) * 0.9);
    newCircle.setAttribute("fill", pion.getCouleur());
    const circleId = `circle-${x}-${y}`;
    newCircle.setAttribute("id", circleId);
    if (pion.getCouleur() === "black") {
      newCircle.setAttribute("stroke", "white");
      newCircle.setAttribute("stroke-width", 2);
    }
    parentSvg.appendChild(newCircle);
    // Réinitialise la couleur des cases sélectionnées
    this.resetCaseColors(this.caseSelect);
    return [newCircle, eatenCircle];
  }

  /**
 * Déplace une dame sur le damier SVG (avec la couronne en texte) 
 * et supprime le pion mangé graphiquement si nécessaire
 * @param {Dame} dame 
 * @param {int} x 
 * @param {int} y 
 * @returns {Array} un tableau : [nouveau cercle, cercle mangé, coordonnees case mangée]
 */
  moveDameSVG(dame, x, y) {
    //! MAJ des tableaux pour l'envoie au serveur
    if (this.currentPlayer === "white" && this.sessionPlayer === "white" || this.currentPlayer === "black" && this.sessionPlayer === "black") {
      this.oldXY.push([pion.getCoordonnee().getX(), pion.getCoordonnee().getY()]);
      this.newXY.push([x, y]);
    }
    const parentSvg = document.getElementById('grille');
    let eatenCircle = null;
    // Supprime le cercle de la dame original
    const circleToRemove = this.getPionSVG(dame.getCoordonnee().getX(), dame.getCoordonnee().getY());
    const crownToRemove = this.getPionSVG(dame.getCoordonnee().getX(), dame.getCoordonnee().getY() + "_text");
    if (circleToRemove) {
      parentSvg.removeChild(circleToRemove);
      parentSvg.removeChild(crownToRemove);
      this.eventedPions = this.eventedPions.filter(circle => circle !== circleToRemove);
    }
    // Calcule toutes les cases de la diagonale
    let diagonalCells = this.getDiagonalCells(dame.getCoordonnee().getX(), dame.getCoordonnee().getY(), x, y, dame.getCouleur());

    let closestCell = null;
    // La case la plus proche de la destination est celle qui peut contenir le pion à supprimer
    if (diagonalCells.length !== 0) {
      closestCell = diagonalCells[diagonalCells.length - 1];
      // Supprime le cercle du pion adverse de la case la plus proche
      eatenCircle = this.getPionSVG(closestCell[0], closestCell[1]);
    }
    else {
      eatenCircle = null;
    }
    if (eatenCircle !== null) {
      parentSvg.removeChild(eatenCircle);
      if (document.getElementById(eatenCircle.getAttribute("id") + "_text")) {
        parentSvg.removeChild(document.getElementById("circle-" + eatenX + "-" + eatenY + "_text"));
      }
      this.eventedPions = this.eventedPions.filter(circle => circle !== eatenCircle);
      if (this.currentPlayer === "white") {
        this.player1Score++;
        this.blackPions = this.blackPions.filter(circle => circle !== eatenCircle);
      } else {
        this.player2Score++;
        this.whitePions = this.whitePions.filter(circle => circle !== eatenCircle);
      }
      this.updateScores();
    }
    // Ajoute un nouveau cercle sur la case cliquée
    const newCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    newCircle.setAttribute("cx", y * this.tailleCase + this.tailleCase / 2);
    newCircle.setAttribute("cy", x * this.tailleCase + this.tailleCase / 2);
    newCircle.setAttribute("r", (this.tailleCase / 2) * 0.9);
    newCircle.setAttribute("fill", dame.getCouleur());
    const circleId = `circle-${x}-${y}`;
    newCircle.setAttribute("id", circleId);
    if (dame.getCouleur() === "black") {
      newCircle.setAttribute("stroke", "white");
      newCircle.setAttribute("stroke-width", 2);
    }
    parentSvg.appendChild(newCircle);
    this.transformDameSVG(newCircle);
    // Réinitialise la couleur des cases sélectionnées
    this.resetCaseColors(this.caseSelect);
    return [newCircle, eatenCircle, closestCell];
  }

  /**
   * Renvoie les coordonnées de toutes les cases de la diagonale entre deux cases
   * @param {int} startX 
   * @param {int} startY 
   * @param {int} endX 
   * @param {int} endY 
   * @returns {Array} 
   */
  getDiagonalCells(startX, startY, endX, endY, couleur) {
    let cells = [];
    let currentX = startX;
    let currentY = startY;
    while ((currentX !== endX || currentY !== endY) && !(currentX === endX && currentY === endY)) {
      currentX += endX > startX ? 1 : (endX < startX ? -1 : 0);
      currentY += endY > startY ? 1 : (endY < startY ? -1 : 0);
      // Ajoute les coordonnées à la liste, mais exclut la case d'arrivée
      if (!(currentX === endX && currentY === endY)) {
        cells.push([currentX, currentY]);
      }
    }
    // Inverser le tableau si les directions sont vers le haut
    if (couleur === 'white' && endX < startX) {
      cells.reverse();
    }
    return cells;
  }

  /**
   * Récupère une case graphique à partir de coordonnées
   * @param {number} x - Coordonnée x de la case
   * @param {number} y - Coordonnée y de la case
   * @returns {SVGRectElement|null} - Retourne l'élément SVG rect de la case ou null si non trouvé
   */
  getCaseSVG(x, y) {
    const svg = document.getElementById('grille');
    const rectId = `rect-${x}-${y}`;
    return svg.getElementById(rectId);
  }

  /**
   * Récupère un pion graphique à partir de coordonnées
   * @param {int} x 
   * @param {int} y 
   * @returns {SVGCircleElement} - Retourne l'élément SVG circle du pion ou null si non trouvé
   */
  getPionSVG(x, y) {
    const parentSvg = document.getElementById('grille');
    const circleId = `circle-${x}-${y}`;
    const circle = parentSvg.getElementById(circleId);
    return circle;
  }

  /**
   * Remet les cases selectionnées en noir
   * @param {Array} cases un tableau de cases SVG
   */
  resetCaseColors(cases) {
    cases.forEach((caseElement) => {
      caseElement.setAttribute("fill", "black");
    });
    this.removeEventsCase();
  }

  /**
   * Transforme un pion SVG en dame SVG (ajoute une couronne en texte)
   * @param {SVGCircleElement} pionSVG
   */
  transformDameSVG(pionSVG) {
    const parentSvg = document.getElementById('grille');
    if (pionSVG) {
      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      const circleId = pionSVG.getAttribute("id"); // Récupérer l'ID du cercle
      const x = parseInt(circleId.split("-")[1]); // Récupérer la coordonnée x
      const y = parseInt(circleId.split("-")[2]); // Récupérer la coordonnée y
      text.setAttribute("x", y * this.tailleCase + this.tailleCase / 2);
      text.setAttribute("y", x * this.tailleCase + this.tailleCase / 2);
      text.setAttribute("font-size", "20");
      text.setAttribute("font-family", "Arial, sans-serif");
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("alignment-baseline", "middle");
      text.setAttribute("fill", pionSVG.getAttribute("fill") === "white" ? "black" : "white");
      text.setAttribute("id", circleId + "_text");
      text.textContent = "♛";
      parentSvg.appendChild(text);
    }
  }

  /**
   * Supprime les événements des pions non bougés et met à jour les tableaux de pions (blancs ou noirs)
   * @param {Pion} movedPion le pion déplacé
   * @param {int} mode 1: normal, 0: remanger
   */
  removeEventsPion(movedPion, mode) {
    if (mode === 1) {
      const newEventedPions = this.eventedPions.map(circle => circle.cloneNode(true));
      // Remplacer les anciens pions par les clones
      this.eventedPions.forEach((circle, index) => {
        try {
          circle.parentNode.replaceChild(newEventedPions[index], circle);
        }
        catch (e) {
          console.log(e)
        }
      });
      // Mettre à jour whitePions ou blackPions selon le joueur courant
      if (this.currentPlayer === "white") {
        this.whitePions = newEventedPions;
        this.whitePions.push(movedPion);
      } else {
        this.blackPions = newEventedPions;
        this.blackPions.push(movedPion);
      }
    }
    else {
      if (this.currentPlayer === "white") {
        this.whitePions.splice(this.whitePions.length - 1, 1)
        this.whitePions.push(movedPion);
      }
      else {
        this.blackPions.splice(this.blackPions.length - 1, 1)
        this.blackPions.push(movedPion);
      }
    }
  }

  /**
   * Supprime les événements des cases de sélection
   */
  removeEventsCase() {
    // Cloner les cases de sélection
    const newCaseSelect = this.caseSelect.slice(1).map(caseChoice => caseChoice.cloneNode(true));
    // Remplacer les anciennes cases de sélection par les clones
    for (let i = 1; i < this.caseSelect.length; i++) {
      try {
        this.caseSelect[i].parentNode.replaceChild(newCaseSelect[i - 1], this.caseSelect[i]);
      }
      catch (e) {
        console.log(e)
      }
    }
    if (this.caseSelect.length > 0) {
      this.caseSelect = [this.caseSelect[0], ...newCaseSelect];
    }
  }

  /**
   * Met à jour les scores des joueurs dans l'interface
   */
  updateScores() {
    document.getElementById('player1-score').textContent = `Joueur 1: ${this.player1Score}`;
    document.getElementById('player2-score').textContent = `Joueur 2: ${this.player2Score}`;
  }

  /**
   * Met à jour le joueur courant dans l'interface
   */
  updateCurrentPlayer() {
    document.getElementById('current-player').textContent = `Tour de: Joueur ${this.currentPlayer}`;
  }
}