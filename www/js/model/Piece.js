import Coordonnee from './Coordonnee.js'

/**
 * Une pièce du jeu (pion ou dame)
 */
export default class Piece {

  constructor(x, y, couleur) {
    this.coordonnee = new Coordonnee(x, y)
    this.couleur = couleur;
  }

  /**
   * Retourne les coordonnées de la pièce
   * @returns {Coordonnee} les coordonnées
   */
  getCoordonnee() {
    return this.coordonnee;
  }

  /**
   * Retourne la couleur de la pièce
   * @returns {String} la couleur
   */
  getCouleur() {
    return this.couleur;
  }

  /**
   * Modifie les coordonnées de la pièce
   * @param {int} x 
   * @param {int} y 
   */
  setCoordonnee(x, y) {
    this.coordonnee = new Coordonnee(x, y)
  }

  

}
