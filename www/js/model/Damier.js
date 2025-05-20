import Pion from './Pion.js';
import Dame from './Dame.js';
import Case from './Case.js';


/**
 * Le plateau de jeu
 */
export default class Damier {

  constructor(casesParLigne) {
    this.casesParLigne = casesParLigne;
    this.pions = this.initialiserPions();
    this.damier = this.initialiserDamier();
  }

  /**
   * Crée un damier avec des cases et des pions
   * @returns un tableau de cases
   */
  initialiserDamier() {
    const damier = new Array(this.casesParLigne);
    //rempli le damier de cases
    for (let i = 0; i < this.casesParLigne; i++) {
      damier[i] = new Array(this.casesParLigne);
      for (let j = 0; j < this.casesParLigne; j++) {
        damier[i][j] = new Case(i, j, (i + j) % 2 == 0 ? "white" : "black");
      }
    }
    //place les pions dans sur cases
    for (let i = 0; i < this.pions.length; i++) {
      const pion = this.pions[i];
      damier[pion.getCoordonnee().getX()][pion.getCoordonnee().getY()].setPion(pion);
    }
    return damier;
  }

  initialiserPions() {
    const pions = [];
    for (let i = 0; i < this.casesParLigne; i++) {
      for (let j = 0; j < this.casesParLigne; j++) {
        // Ajoutez les pions en fonction des positions et de la couleur
        if ((i + j) % 2 != 0 && i < 3) {
          pions.push(new Pion(i, j, "black"));
        } else if ((i + j) % 2 != 0 && i > this.casesParLigne - 4) {
          pions.push(new Pion(i, j, "white"));
        }
      }
    }
    return pions;
  }

  /**
   * Renvoie une Case du tableau damier à partir de ses coordonnées
   * @param {int} x coordonnée x
   * @param {int} y coordonnée y
   * @returns {Case} la case du damier
   */
  getCase(x, y) {
    return this.damier[x][y];
  }

  /**
   * Supprime un pion du damier
   * @param {Pion} pion 
   */
  removePion(pion) {
    this.damier[pion.getCoordonnee().getX()][pion.getCoordonnee().getY()].setPion(null);
  }

  /**
   * Transfomre un pion en dame
   * @param {Pion} pion 
   */
  upgradePion(pion) {
    this.removePion(pion);
    this.damier[clone.getCoordonnee().getX()][clone.getCoordonnee().getY()].setPion(new Dame(clone.getCoordonnee().getX(), clone.getCoordonnee().getY(), clone.getCouleur()));
  }

  /**
   * Affiche le damier dans la console
   * 0 = case vide
   * 1 = case noire
   * b = pion blanc
   * n = pion noir
   */
  showConsole() {
    for (let i = 0; i < this.casesParLigne; i++) {
      let ligne = "";
      for (let j = 0; j < this.casesParLigne; j++) {
        const pion = this.damier[i][j].getPion();
        if (pion instanceof Pion) {
          // Pion normal
          ligne += (pion.getCouleur() === 'black' ? 'n' : 'b') + ' ';
        } else if (pion instanceof Dame) {
          // Dame
          ligne += (pion.getCouleur() === 'black' ? 'N' : 'B') + ' ';
        } else {
          // Case vide
          ligne += (this.damier[i][j].getCouleur() === 'black' ? '1' : '0') + ' ';
        }
      }
      console.log(ligne);
    }
  }

}


