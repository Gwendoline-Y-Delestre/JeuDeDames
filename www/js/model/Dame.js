import Piece from './Piece.js';

/**
 * Une dame (pion évolué)
 */
export default class Dame extends Piece {
  constructor(x, y, couleur) {
    super(x, y, couleur);
    this.lastEat = [];
  }

  /**
  * Déplace une pièce sur le damier (et met à jour ses coordonnées)
  * @param {Damier} damierObj
  * @param {int} x coordonnée x de la case de destination
  * @param {int} y coordonnée y de la case de destination
  */
  move(damierObj, x, y, eatenCoord) {
    let damier = damierObj.damier;
    // Supprime le pion mangé
    if(eatenCoord !== null){
      damier[eatenCoord[0]][eatenCoord[1]].setPion(null);
    }
    let pion = damier[this.getCoordonnee().getX()][this.getCoordonnee().getY()].getPion();
    damier[this.getCoordonnee().getX()][this.getCoordonnee().getY()].setPion(null);
    damier[x][y].setPion(pion);
    this.setCoordonnee(x, y);
    damierObj.damier = damier;
    return damierObj;
  }

  /**
   * Renvoie les coordonnées des cases où un pion peut bouger(déplacement simple ou prise)
   * @param { Array } damier
   * @returns { Array } tableau de coordonnées 
   */
  moveChoice(damierObj) {
    const damier = damierObj.damier;
    const x = this.getCoordonnee().getX();
    const y = this.getCoordonnee().getY();
    const coord = [];
    // Ajoute les choix de mouvement dans toutes les directions diagonales
    let direction1 = this.addMovesInDirection(damier, x, y, 1, 1);  // diagonale bas-droite
    let direction2 = this.addMovesInDirection(damier, x, y, 1, -1); // diagonale bas-gauche
    let direction3 = this.addMovesInDirection(damier, x, y, -1, 1); // diagonale haut-droite
    let direction4 = this.addMovesInDirection(damier, x, y, -1, -1);// diagonale haut-gauche
    // Ajoute les coordonnées des cases dans toutes les directions
    [...direction1, ...direction2, ...direction3, ...direction4].forEach(dir => {
        coord.push(dir);
    });
    // Ajoute les coordonnées des cases où la dame peut manger un adversaire
    this.eatChoice(damierObj, [direction1, direction2, direction3, direction4]).forEach(eatCoord => {
      coord.push(eatCoord[0]);
    });
    return coord;
  }

  /**
   * Renvoie les coordonnées des cases où un pion peut manger un adversaire
   * @param { Array } damier
   * @param { Array } directions tableau de tableaux de coordonnées [direction1, direction2, direction3, direction4]
   * @returns { Array } tableau de coordonnées : [caseArrivee, caseMangee]
   */
  eatChoice(damierObj, directions) {
    const damier = damierObj.damier;
    const x = this.getCoordonnee().getX();
    const y = this.getCoordonnee().getY();
    const coord = [];
    // Ajoute les choix de mouvement dans toutes les directions diagonales
    let direction1 = directions[0];  // diagonale bas-droite
    let direction2 = directions[1]; // diagonale bas-gauche
    let direction3 = directions[2]; // diagonale haut-droite
    let direction4 = directions[3];// diagonale haut-gauche
    let last1;
    let last2;
    let last3;
    let last4;
    if(direction1.length == 0)
      last1 = [this.getCoordonnee().getX(), this.getCoordonnee().getY()];
    else
      last1 = direction1[direction1.length - 1];
    if(direction2.length == 0)
      last2 = [this.getCoordonnee().getX(), this.getCoordonnee().getY()];
    else
      last2 = direction2[direction2.length - 1];
    if(direction3.length == 0)
      last3 = [this.getCoordonnee().getX(), this.getCoordonnee().getY()];
    else
      last3 = direction3[direction3.length - 1];
    if(direction4.length == 0)
      last4 = [this.getCoordonnee().getX(), this.getCoordonnee().getY()];
    else
      last4 = direction4[direction4.length - 1];

    if (last1 && last1[0] + 1 < damier.length && last1[1] + 1 < damier.length &&
      last1[0] + 2 < damier.length && last1[1] + 2 < damier.length && 
      damier[last1[0] + 1][last1[1] + 1].getPion() != null && 
      damier[last1[0] + 1][last1[1] + 1].getPion().getCouleur() != this.getCouleur() && 
      damier[last1[0] + 2][last1[1] + 2].getPion() == null) {
        coord.push([[last1[0] + 2, last1[1] + 2], [last1[0] + 1, last1[1] + 1]]);
    }
    if (last2 && last2[0] + 1 < damier.length && last2[1] - 1 >= 0 && 
      last2[0] + 2 < damier.length && last2[1] - 2 >= 0 && 
      damier[last2[0] + 1][last2[1] - 1].getPion() != null && 
      damier[last2[0] + 1][last2[1] - 1].getPion().getCouleur() != this.getCouleur() && 
      damier[last2[0] + 2][last2[1] - 2].getPion() == null) {
        coord.push([[last2[0] + 2, last2[1] - 2], [last2[0] + 1, last2[1] - 1]]);
    }
    if (last3 && last3[0] - 1 >= 0 && last3[1] + 1 < damier.length && 
      last3[0] - 2 >= 0 && last3[1] + 2 < damier.length && 
      damier[last3[0] - 1][last3[1] + 1].getPion() != null && 
      damier[last3[0] - 1][last3[1] + 1].getPion().getCouleur() != this.getCouleur() && 
      damier[last3[0] - 2][last3[1] + 2].getPion() == null) {
        coord.push([[last3[0] - 2, last3[1] + 2], [last3[0] - 1, last3[1] + 1]]);
    }
    if (last4 && last4[0] - 1 >= 0 && last4[1] - 1 >= 0 && 
      last4[0] - 2 >= 0 && last4[1] - 2 >= 0 && 
      damier[last4[0] - 1][last4[1] - 1].getPion() != null && 
      damier[last4[0] - 1][last4[1] - 1].getPion().getCouleur() != this.getCouleur() && 
      damier[last4[0] - 2][last4[1] - 2].getPion() == null) {
        coord.push([[last4[0] - 2, last4[1] - 2], [last4[0] - 1, last4[1] - 1]]);
    }
    return coord;
  }

  /**
   * Ajoute les coordonnées des cases dans une direction donnée, 
   * jusqu'à ce qu'il y ait un obstacle
   * @param {int} taille
   * @param {int} x
   * @param {int} y
   * @param {int} directionX 
   * @param {int} directionY 
   * @returns {Array} tableau de coordonnées
   */
  addMovesInDirection = (damier, x, y, directionX, directionY) => {
    let newX = x + directionX;
    let newY = y + directionY;
    const taille = damier.length;
    let coord = [];
    while (newX >= 0 && newX < taille && newY >= 0 && newY < taille && damier[newX][newY].getPion() === null) {
      coord.push([newX, newY]);
      newX += directionX;
      newY += directionY;
    }
    return coord;
  };

}