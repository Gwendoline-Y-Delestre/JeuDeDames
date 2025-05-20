export default class Joueur{

    constructor(nb){
      if (nb==1){
        this.color= "blanc";
      }
      else if(nb==2){
        this.color= "noir";
      }
      this.nbPions = 20;
    }

    getNbPions(){
      return this.nbPions;
    }

}