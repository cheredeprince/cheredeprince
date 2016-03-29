/**
 * MathElt.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

var Lodash = require('lodash'),
    Twitter= require('twitter-text');

var types = {
    def : "définition",
    lem : "lemme",
    prop: "propriété",
    th  : "théorème",
    cor : "corollaire",
    axiom : "axiome",
    conj: "conjecture"
}

module.exports = {

    types:{
	mathName: function(value){
	    return mathName;
	},
	uniqueName: function(value) {
	    return uniqueName;	    
	}
    },

    shema: true, 

    attributes: {
	name: {
	    type: 'string',
	    mathName: true,
	    required: true,
	    uniqueName: true
	},
	oldNames:{
	    type: 'array'
	},
	title: {
	    type: 'string',
	    required: true
	},
	type:{
	    type: 'string',
	    'enum': Object.keys(types),
	    required: true
	},
	published:{
	    type: 'boolean',
	    defaultsTo: true
	},
	publishedAt:{
	    type: 'date'  
	},
	content:{
	    type: 'text',
	    required :true
	},
	contentHTML:{
	    type:'text'
	},
	tags:{
	    collection: 'MathTag',
	    via: 'elements'
	},
	tagsName:{
	    type: 'array'
	},
	ems:{
	    type: 'array'
	},
	strongs: {
	    type: 'array'
	},
	parents:{
	    collection: 'MathElt',
	    via: 'children'
	},
	parentsName:{
	    type: 'array',
	    defaultsTo: []
	},
	children:{
	    collection: 'MathElt',
	    via: 'parents'
	},
	ancestors:{
	    type: 'array',
	    defaultsTo: []
	},
	keywords:{
	    collection: 'MathKeyword',
	    via: 'elements'
	},
	scorePerKeyword:{
	    type:'json'
	},
	exprPerKeyword:{
	    type: 'json'
	},
	keywordsName:{
	    type: 'array'
	},
	
	toOBJ: function(){
	    //retourne l'objet en élément à envoyer
	    var elt = this,
		obj = this.toObject(),
		return_obj = {};

	    return_obj.id = obj.id
	    return_obj.name = obj.name
	    return_obj.title = obj.title
	    return_obj.type = obj.type
	    return_obj.content = obj.contentHTML
	    return_obj.tags = obj.tagsName
	    return_obj.createdAt = obj.createdAt
	    
	    //mise en forme des parties de texte
	    return_obj.typeDisplay = types[elt.type]

	    return_obj.parents = [];
	    return_obj.children = [];
	    var key;

	    if(obj.parents && obj.parents.length)
		for(key = 0; key< obj.parents.length;key++){
		    return_obj.parents.push({
			name : obj.parents[key].name,
			title: obj.parents[key].title,
			type : obj.parents[key].type
		    })
		}
	    
	    if(obj.children && obj.children.length)
		for(key = 0; key< obj.children.length;key++){
		    return_obj.children.push({
			name : obj.children[key].name,
			title: obj.children[key].title,
			type : obj.children[key].type
		    })
		}
	    
	    return(return_obj)
	},

	toMiniOBJ: function(){
	    //retroune une description de l'élément
	    var elt = this,
		obj = this.toObject(),
		return_obj={};
	    
	    return_obj = {
		name : obj.name,
		title: obj.title,
		type : obj.type
	    }
	    return return_obj;
	}
    },
    beforeValidate: function(values,next){
	// on vérifie que le nom est bien un URI
	mathName = values.name == Lodash.snakeCase(values.name) && Twitter.isValidUsername('@'+values.name);

	//on vérifie que le nom est unique
	MathElt.find({name: values.name}, function(err,records){
	    uniqueName = !err && (records.length == 0 || records[0].id == values.id);
	    next();
	});
    },
    createElt: function(values, next){
	beforeCreateOrUpdate(values,function(){

	    // on met en place les collections
	    /* On compte les étapes et on délinie la fonction finale*/
	    var cpt = 0,
		length = 2,
		parentsKeywordsName;
	    var atEnd = function(){
		cpt++;
		if(cpt == length){

		    setKeywords(values,parentsKeywordsName,function(err){
			if(err) return next(err);
			MathElt.create(values,function(err){
			    if(err) return next(err);
			    afterCreateElt(values,next);
			});
		    });
		}
	    } ;
	    /*mise en place des parents et ancetres */
	    MathElt.find({name: values.parentsName},function(err,parents){
		if(err) return next(err)

		// construit les nouveaux ancetres = ancetres des parents + parents
		var pureAncestors = _.flatten(_.pluck(parents,'ancestors')),
		    parentsName  = _.pluck(parents,'name'),
		    eltAncestors = _.union(pureAncestors,parentsName);
		//on définit les ancetres
		values.ancestors = eltAncestors;
		//on stocke la liste des parents non ancestre
		values.parentsNotAncestors = _.difference(parentsName,pureAncestors);
		//on actualise les parents
		values.parents = _.pluck(parents,'id');
		//on garde les noms des parents existant
		values.parentsName = parentsName;
		//on récupère les keywords de tous les parents
		parentsKeywordsName = _.flatten(_.pluck(parents,'keywordsName'));
		atEnd();
	    });
	    /*mise en place des tags*/
	    MathTag.findOrCreateListNames(values.tagsName,function(err,tags){
		if(err) return next(err);
		//on met à jour les tags
		values.tags = _.pluck(tags,'id');
		atEnd()
	    });
	});
    },
    updateElt: function(id,values, next){
	beforeCreateOrUpdate(values,function(){
	    MathElt.findOne(id)
		.populate('tags')
		.populate('parents')
		.exec(function(err,elt){
		    if(err) return next(err)
		    if(!elt) return next();
		    // on met en place les collections
		    /* On compte les étapes et on délinie la fonction finale*/
		    var cpt = 0,
			length = 2,
			parentsKeywordsName,
			oldName = elt.name,
			removedParents,
			addedParents;
		    var atEnd = function(){
			cpt++;
			if(cpt == length){
			    setKeywords(values,parentsKeywordsName,function(err){
				if(err) return next(err);
				//on précise le id
				values.id = id;
				MathElt.update(id,values,function(err){
				    if(err) return next(err);
				    afterUpdateElt(values,oldName,removedParents,addedParents,next);
				});
			    });
			}
		    } ;
		    /*ajout d'un ancien nom*/
		    if(values.name != elt.name)
			values.oldNames = (elt.oldNames)?elt.oldNames.concat([elt.name]): [elt.name];
		    /*mise en place des parents et ancetres */
		    MathElt.find({name: values.parentsName},function(err,parents_updated){
			if(err) return next(err)
			// construit les nouveaux ancetres = ancetres des parents + parents
			var pureAncestors = _.flatten(_.pluck(parents_updated,'ancestors')),
			    parentsName  = _.pluck(parents_updated,'name'),
			    eltAncestors = _.union(pureAncestors,parentsName);
			//Si il n'y a pas de problème de génération
			if(eltAncestors.indexOf(elt.name) === -1){
			    //on définit les ancetres
			    values.ancestors = eltAncestors;
			    //on actualise les parents
			    values.parents = _.pluck(parents_updated,'id');
			    //on stocke la liste des parents non ancestre
			    values.parentsNotAncestors = _.difference(parentsName,pureAncestors);
			    //on garde les noms des parents existant
			    values.parentsName = parentsName;
			    //on récupère le nom des kw des parents
			    parentsKeywordsName = _.flatten(_.pluck(parents_updated,"keywordsName"));
			    addedParents = _.difference(parentsName,elt.parentsName);
			    removedParents = _.difference(elt.parentsName,parentsName);
			    atEnd();
			}else{
			    //on a des prolblèmes de générations
			    //on restore les anciens parents et ancetres
			    values.parentsName = elt.parentsName;
			    values.parentsNotAncestors = elt.parentsNotAncestors;
			    values.parents     = _.pluck(elt.parents,"id");
			    values.ancestors   = elt.ancestors;
			    parentsKeywordsName= _.flatten(_.pluck(elt.parents,"keywordsName"));
			    addedParents = [];
			    removedParents = [];
			    atEnd();
			}
		    });
		    /*mise en place des tags*/
		    MathTag.findOrCreateListNames(values.tagsName,function(err,tags){
			if(err) return next(err);
			//on met à jour les tags
			values.tags = _.pluck(tags,'id');
			atEnd()
		    });
		});
	});
    },
    completeName : function(beginName,next){
	
	MathElt.find({name:RegExp("^"+Lodash.snakeCase(beginName)+"[a-zA-Z_]*$","g")}).populate('children').exec(function(err,elts){
	    if(err) return next(err);
	    
	    var completedNames = _.pluck(ModelAssets.sortWithUpdate(elts,'.children.length',12,10),"name")
	    
	    next(err,completedNames)
	})
    }
}

var beforeCreateOrUpdate = function(values, next){

    values.name = (values.name)? values.name:'';
    values.content = (values.content)? values.content:'';

    ConvertString.parseMathText(values.content,function(obj){
	values.parentsName = obj.parents;
	//on évite le cas de la boucle simple
	if(values.parentsName.indexOf(values.name) !== -1)
	    delete values.parentsName[values.parentsName.indexOf(values.name)]
	values.tagsName = obj.tags;
	values.ems = obj.ems;
	values.strongs = obj.strongs;
	values.contentHTML = obj.html;
	next()
    })

},
    afterCreateElt= function(values, next){
	next();
	//On met à jour l'élément au sein du graphe
	MathGraph.newElement(values.name,values.title,values.type,values.parentsNotAncestors,function(err){
	    if(err) throw err;
	});	
    },

    afterUpdateElt= function(values,oldName,removedParents,addedParents,next){
	next();
	    //on met  jour le graphe de manière async
	    MathGraph.updateElement(oldName,values.name,values.title,values.type,values.parentsNotAncestors,function(err){
		if(err) throw err;
		if(oldName == values.name) return;
		//puis on met à jour le nom dans les éléments
		updateName(oldName,values.name,function(err){
		    if(err) throw err;
		});
	    });
    },
    updateName = function(oldName,name,next){
	MathElt.find().exec(function(err,elts){
	    if(err) next(err);
	    var cpt, elt,index,nb = 0;
	    for(cpt=0;cpt<elts.length;cpt++){
		elt =elts[cpt];
		index = elt.ancestors.indexOf(oldName);
		if(index != -1){
		    elt.ancestors[index] = name;
		    index = elt.parentsName.indexOf(oldName);
		    if(index != -1){
			elt.parentsName[index] = name;
		    }
		    elt.save(function(err){
			if(err) return next(err);
			nb++;
			if(nb == elts.length){
			    next();
			}
		    });
		}else{
		    nb++;
		    if(nb == elts.length){
			next();
		    }
		}
	    }
	});
    },
    /*
     * Attribue les valeurs de kw kwName,scoreperkw et exprPerkw
     */
    setKeywords = function(values,parentsKeywordsName,next){

	//initialisation
	values.keywords       = [];
	values.keywordsName   = [];
	values.exprPerKeyword = {};
	values.scorePerKeyword= {};
	var subSetter= function(sentences,scoreTotal,next){

	    var key;
	    MathKeyword.extractAndRecordMulti(sentences,function(err,kws,exprPerKw){

		if(err) return next(err);
	    	values.keywords       = _.union(values.keywords,_.pluck(kws,"id"));
		values.keywordsName   = _.union(values.keywordsName,_.pluck(kws,"name"));
		// Les mots composé sont deux fois mieux noté que les autres et ils partagent tous un score de 300 points au maximum
		var scorePerkw =(kws.length !=0)? parseInt(scoreTotal/(2*kws.length)): 0;
		for(key = 0; key<kws.length;key++){

		    //si on a pas encore ajouté ce mot clé
		    if(!values.exprPerKeyword[kws[key].name])
			values.exprPerKeyword[kws[key].name] = exprPerKw[kws[key].name];
		    else
			values.exprPerKeyword[kws[key].name] = _.union(values.exprPerKeyword[kws[key].name],exprPerKw[kws[key].name]);
		    //suivant que le mot est composé ou non
		    if(values.scorePerKeyword[kws[key].name])
			values.scorePerKeyword[kws[key].name] +=
			(kws[key].name.indexOf('_') == -1)? scorePerkw: 2*scorePerkw;
		    else
			values.scorePerKeyword[kws[key].name] =
			(kws[key].name.indexOf('_') == -1)? scorePerkw: 2*scorePerkw;
		}
		next(null);
	    });
	};


	
	ConvertString.dropParents(values.content,function(content,parents){
	    ConvertString.dropTags(content,function(content,tags){
		MathKeyword.find({},function(err,keywords){
		    if(err) return next(err);

		    var heritedExprs = _.compact(_.values(ConvertString.searchKeywords(content,parentsKeywordsName)));
		//	contentExprs = _.compact(_.values(ConvertString.searchKeywords(content,_.pluck(keywords,"name"))));

		    //mettre à jour les keys issue des parents		  
		    subSetter(heritedExprs,300,function(err){
			if(err) return next(err);
			//puis les tags
			subSetter(values.tagsName,500,function(err){
			    if(err) return next(err);
			    //puis les ems
			    subSetter(values.ems,500,function(err){
				if(err) return next(err);
				//puis les strongs
				subSetter(values.strongs,700,function(err){
				    if(err) return next(err);
				    //puis le titre
				    subSetter([values.title],1000,function(err){
					if(err) return next(err);
					//on met les kw connus
					//subSetter(contentExprs,200,function(err){
					    if(err) return next(err);
					    next(null);
					    
					//})
				    })
				})
			    })
			})
		    })
		})
	    })
	})
    }
