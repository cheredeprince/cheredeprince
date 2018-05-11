/*
 * ModelAssets est un service qui contient des outils généraux pour les models
 */
var Lodash = require('lodash');
module.exports= {
  arraytoOBJ : function(array, next){
    var cpt;
    if(array.length == 0)
      return next(array);
    
    for(cpt=0;cpt< array.length;cpt++){
      array[cpt] = array[cpt].toOBJ();
    }
    return next(array);
  },
  
  /*
   * Tri les elts d'un model en fonction d'un paramètre de grandeur entières et la durée qui le sépare de sa dernière maj

   *Les durées sont en heures et en halfTime heures l'influence de weightOfTime a diminué de moitié 
   */
  sortWithUpdate:function(elts,paramName,halfLife,weightOfTime){
    var scorePerElt = {},key;

    if(elts.length ==0)
      return elts
    for(key = 0; key<elts.length;key++){
      //le score est la valeur du param
      var score = (Lodash.get(elts[key],paramName))?Lodash.get(elts[key],paramName):0;
      //le score est augmenté par sa proximité avec sa dernière maj
      var time_since_up= parseInt(new Date() -elts[key].updatedAt)/( 1000 * 60*60)
      scorePerElt[elts[key].id] =score+ weightOfTime*Math.exp(time_since_up*Math.log(.5)/halfLife)
    }
    
    return elts.sort(function(a,b){
      return scorePerElt[b.id] - scorePerElt[a.id];
    })
    
  },
  /*
   *updateCollection met à jour une collection d'éléments d'un autre élément
   args: * elt : l'élément à mettre à jour
   * collectionName : le nom de la collection dans l'élément
   * collectionUpdated:  list des id's à mettre à la place de ceux existant dans collectionName 
   returns : 
   */
  updateCollection: function(elt,collectionName,collectionUpdated,next){
    //supprime les elts de elt[collectionName] inexistants dans collectionUpdated
    elt[collectionName].forEach(function(collectionElt){
      if(collectionUpdated.indexOf(collectionElt.id) ==-1)
	elt[collectionName].remove(collectionElt.id)
    })
    
    //on ajoute les nouveaux éléments
    if(collectionUpdated.length == 0)
      next(null)
    collectionUpdated.forEach(function(id,key){
      elt[collectionName].add(id)
      
      if(key +1 == collectionUpdated.length){
	next(null)
      }
    })
  }
}
