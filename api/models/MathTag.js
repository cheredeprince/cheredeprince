/**
 * MathTag.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

var Lodash = require('lodash');

module.exports = {


    shema: true, 

    attributes: {
	name: {
	    type: 'string',
	    required: true
	},
	snakeName:{
	    type: 'string'
	},
	elements:{
	    collection: 'MathElt',
	    via: 'tags'
	}
    },
    beforeUpdate: function(values,next){
	values.snakeName = Lodash.snakeCase(values.name);
	next();
    },
    beforeCreate: function(values,next){
	values.snakeName = Lodash.snakeCase(values.name);
	next();
    },

    findOrCreateListNames : function(listNames,next){
	var cpt = 0, records = [];

	if(listNames.length == 0)
	    return next(null,records);
	
	listNames.forEach(function(tagName,key){
	    MathTag.findOrCreate({name:tagName},{name:tagName},function(err,tag){
		if(err) return next(err);
		records.push(tag);
		cpt++;
		if(cpt == listNames.length)
		    next(null,records);
	    });
	});
	
    },
    completeName : function(beginName,next){
	MathTag.find({snakeName:RegExp("^"+Lodash.snakeCase(beginName)+"[a-zA-Z_]*$","g")}).populate('elements').exec(function(err,tags){
	    if(err) return next(err);
	    //voir modelAssets pour explication
	    var elts = tags, weightOfTime = 10, halfLife = 12, paramName = '.elements.length';
	    var scorePerElt = {},key;
	    
	    if(elts.length ==0)
		return elts
	    for(key = 0; key<elts.length;key++){
		//le score est la valeur du param
		var score = (Lodash.get(elts[key],paramName))?Lodash.get(elts[key],paramName):0;
		//le score est augmenté par sa proximité avec sa dernière maj
		var time_since_up= parseInt(new Date() - _.max( _.pluck(elts[key].elements, "updatedAt") ) )/( 1000 * 60*60);
		scorePerElt[elts[key].id] =score+ weightOfTime*Math.exp(time_since_up*Math.log(.5)/halfLife)
	    }
	  
	    var completedNames = _.pluck(elts.sort(function(a,b){
		return scorePerElt[b.id] - scorePerElt[a.id];
	    }),"name");
	    
	    next(err,completedNames);
	});
    }
};
