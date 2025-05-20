import Coordonnee from './Coordonnee.js';

/**
 * Une case du damier
 */
export default class Case {

    constructor(x, y, couleur) {
        this.coordonnee = new Coordonnee(x, y)
        this.couleur = couleur;
        this.pion = null;
    }

    /**
     * Renvoie les Coordonnees de la case
     * @returns {Coordonnee}
     */
    getCoordonnee() {
        return this.coordonnee;
    }

    /**
     * Renvoie la couleur de la Case
     * @returns {String}
     */
    getCouleur() {
        return this.couleur;
    }

    /**
     * Renvoie la Piece sur la case, null si rien
     * @returns {Piece}
     */
    getPion() {
        return this.pion;
    }

    /**
     * Instancie une Piece sur la case
     * @param {Piece} pion 
     */
    setPion(pion) {
        this.pion = pion;
    }

}