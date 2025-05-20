import Piece from './Piece.js';
import Case from './Case.js';
import Dame from './Dame.js';

/**
 * Un pion classique
 */
export default class Pion extends Piece {
  constructor(x, y, couleur) {
    super(x, y, couleur);
  }

  /**
 * Déplace une pièce sur le damier (et met à jour ses coordonnées)
 * @param {Damier} damierObj
 * @param {int} x coordonnée x de la case de destination
 * @param {int} y coordonnée y de la case de destination
 */
  move(damierObj, x, y, eatenCoord) {
    let choices = this.moveChoice(damierObj);
    let damier = damierObj.damier;
    // Vérifie si les coordonnées sont dans les choix possibles
    if (choices.some(coord => coord[0] === x && coord[1] === y)) {
      let pion = damier[this.getCoordonnee().getX()][this.getCoordonnee().getY()].getPion();
      damier[this.getCoordonnee().getX()][this.getCoordonnee().getY()].setPion(null);
      // Si la case de destination est deux cases plus loin en diagonale, cela signifie que le pion mange un adversaire
      if (Math.abs(x - this.getCoordonnee().getX()) === 2 && Math.abs(y - this.getCoordonnee().getY()) === 2) {
        // Trouve les coordonnées de la case intermédiaire où se trouve le pion adverse
        let eatenX = (x + this.getCoordonnee().getX()) / 2;
        let eatenY = (y + this.getCoordonnee().getY()) / 2;
        // Supprime le pion adverse de la case intermédiaire
        damier[eatenX][eatenY].setPion(null);
      }
      damier[x][y].setPion(pion);
      this.setCoordonnee(x, y);
    }
  }

  /**
   * Renvoie les coordonnées des cases où un pion peut bouger (déplacement simple ou prise)
   * @param {Damier} damierObj
   * @returns {Array} tableau de coordonnées
   */
  moveChoice(damierObj) {
    let damier = damierObj.damier;
    let taille = damierObj.damier.length;
    let x = this.getCoordonnee().getX();
    let y = this.getCoordonnee().getY();
    let coord = [];
    if (this.getCouleur() == "black") { //si le pion est noir
      // le pion peut avancer d'une case
      if (x + 1 < taille) {
        if (y + 1 < taille) {
          if (damier[x + 1][y + 1].getPion() == null) {
            coord.push([x + 1, y + 1]);
          }
        }
        if (y - 1 >= 0) {
          if (damier[x + 1][y - 1].getPion() == null) {
            coord.push([x + 1, y - 1]);
          }
        }
      }
    }
    else { // Si le pion est blanc
      // Le pion peut avancer d'une case
      if (x - 1 >= 0) {
        if (y + 1 < taille && damier[x - 1][y + 1].getPion() === null) {
          coord.push([x - 1, y + 1]);
        }
        if (y - 1 >= 0 && damier[x - 1][y - 1].getPion() === null) {
          coord.push([x - 1, y - 1]);
        }
      }
    }
    this.eatChoice(damierObj).forEach(eatCoord => {
      coord.push(eatCoord);
    });
    return coord;
  }

  /**
   * 
   * @param {Damier} damierObj 
   * @returns 
   */
  eatChoice(damierObj) {
    let damier = damierObj.damier;
    let taille = damierObj.damier.length;
    let x = this.getCoordonnee().getX();
    let y = this.getCoordonnee().getY();
    let coord = [];
    // le pion peut manger un pion adverse vers le haut
    if (x + 2 < taille) {
      if (y + 2 < taille) {
        if (damier[x + 1][y + 1].getPion() != null && damier[x + 1][y + 1].getPion().getCouleur() != this.getCouleur() && damier[x + 2][y + 2].getPion() == null) {
          coord.push([x + 2, y + 2]);
        }
      }
      if (y - 2 >= 0) {
        if (damier[x + 1][y - 1].getPion() != null && damier[x + 1][y - 1].getPion().getCouleur() != this.getCouleur() && damier[x + 2][y - 2].getPion() == null) {
          coord.push([x + 2, y - 2]);
        }
      }
    }
    // Le pion peut manger un pion adverse vers le bas
    if (x - 2 >= 0) {
      if (y + 2 < taille && damier[x - 1][y + 1].getPion() !== null && damier[x - 1][y + 1].getPion().getCouleur() !== this.getCouleur() && damier[x - 2][y + 2].getPion() === null) {
        coord.push([x - 2, y + 2]);
      }
      if (y - 2 >= 0 && damier[x - 1][y - 1].getPion() !== null && damier[x - 1][y - 1].getPion().getCouleur() !== this.getCouleur() && damier[x - 2][y - 2].getPion() === null) {
        coord.push([x - 2, y - 2]);
      }
    }
    return coord;
  }

  /**
   * Converti un Pion en Dame
   * @param {Array} damier 
   */
  transformInDame(damier) {
    let x = this.getCoordonnee().getX();
    let y = this.getCoordonnee().getY();
    damier[x][y].setPion(new Dame(x, y, this.getCouleur()));
  }

}