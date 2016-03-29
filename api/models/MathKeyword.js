/**
 * MathKeyword.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

var Lodash = require('lodash')
module.exports = {
    shema: true,
    types:{
	uniqueName: function(value) {
	    return uniqueName;	    
	}
    },
    
    attributes: {
	name: {
	    type: 'string',
	    required: true,
	    uniqueName: true
	},
	variants:{
	    type: 'array'
	},
	elements:{
	    collection: 'MathElt',
	    via: 'keywords'
	}
    },
    beforeValidate: function(values,next){	
	//on vérifie que le nom est unique
	MathKeyword.find({name: values.name}, function(err,records){
	    uniqueName = !err && (records.length == 0 || records[0].id == values.id);
	    next();
	})
    },
    beforeCreate: function(values,next){
	if(values.expr)
	    values.variants = [values.expr];
	// on transcrit le nom dans la snake case
	var newName = Lodash.snakeCase(values.name)
	values.name = newName;
	next();
    },
    /*
     * Cherche à partir d'un expression, la crée s'elle n'existe pas, la met à jour sinon
     */
    updateOrCreate: function(expr,next){	
	var newName = Lodash.snakeCase(expr);
	if(newName !== ''){
	    MathKeyword.findOrCreate({name: newName},{name: newName,expr:expr})
		.exec(function(err,keyword){
		    if(err) return next(err)
		    // on ajoute l'expression au besoin
		    if(keyword.variants.indexOf(expr) == -1){
			keyword.variants.push(expr)
			keyword.save(function(err,saved_kw){
			    if(err) return next(err)
			    next(null,saved_kw)
			})
		    }else
			next(null,keyword);
		})
	}else
	    next(null);
    },
    /*
     * Extrait les mots clés d'une phrase et les enregistrent ou met à jour
     */
    extractAndRecord :function(sentence,next){
	var added_kw = [], twoWordsExpr= [],exprPerKeyword={};
	// compact supprime les valeurs ''
	var listOfExpr = Lodash.compact(ConvertString.extractExpr(sentence));
	//on ajoute chaque expr et on forme les expr à 2 mots
	
	var aSync = function(list,cpt,do_two_list,next){
	    if(cpt<list.length -1 && do_two_list)
		twoWordsExpr.push(list[cpt]+' '+listOfExpr[cpt+1])
	    //si la liste est de longueur nulle
	    if(list.length ==0)
		next(null)
	    else
		MathKeyword.updateOrCreate(list[cpt],function(err,keyword){
		    if(err){  return next(err);}
		    
		    if(keyword){
			//on récupére les informations
			added_kw.push(keyword);
			//lorque qu'on rencontre la première le mot clée
			if(!exprPerKeyword[keyword.name])
			    exprPerKeyword[keyword.name] = [list[cpt]];
			else
			    exprPerKeyword[keyword.name].push(list[cpt]);
		    }
		    cpt ++;
		    if(cpt == list.length)
			next(null);
		    else
			aSync(list,cpt,do_two_list,next);
		})   
	}

	aSync(listOfExpr,0,true,function(err){
	    if(err) return next(err);
	    //on ne construit plus la liste des deux mots, on l'enregistre
	    aSync(Lodash.compact(twoWordsExpr),0,false,function(err){
		if(err) return next(err)
		next(null,added_kw,exprPerKeyword);
	    })
	})	
    },
    /*
     * Extrait les mots clés de plusieurs phrase et les enregistrent ou met à jour
     */
    extractAndRecordMulti : function(sentences,next){
	var added_kw=[], exprPerKeyword={};

	var aSync = function(cpt){
	    if(sentences.length == 0)
		next(null,added_kw,exprPerKeyword);
	    else
	    MathKeyword.extractAndRecord(sentences[cpt],function(err,kw_stack,exprPerkw_stack){
		if(err) return next(err);

		cpt++;
		added_kw = Lodash.union(added_kw,kw_stack);

		if(kw_stack.length == 0 && cpt != sentences.length)
		    aSync(cpt);
		else if(kw_stack.length == 0 && cpt == sentences.length)
		    next(null,added_kw,exprPerKeyword);
		
		kw_stack.forEach(function(kw,key){

		    //si on a pas encore ajouté ce mot clé
		    if(!exprPerKeyword[kw.name])
			exprPerKeyword[kw.name] = exprPerkw_stack[kw.name]
		    else
			exprPerKeyword[kw.name] = Lodash.union(exprPerKeyword[kw.name],exprPerkw_stack[kw.name]);
		  //si on a fait tous les elts de kw_stack 
		    if(cpt != sentences.length && key +1 == kw_stack.length)
			aSync(cpt);
		    //si on a fait tous les elts de sentences
		    if(cpt == sentences.length && key +1 == kw_stack.length){
			next(null,added_kw,exprPerKeyword);
		    }
		})
	    })
	}
	aSync(0);
    },
    /*
     * Recherche tous les éléments, qui correspondent à la requête dans la limite imposée
     */
    search: function(query,ended,next){
	ConvertString.dropParents(query,function(content,ancestors){
	    ConvertString.dropTags(content,function(content,tags){
		
		var sentence = content.trim();
		//On effectue la recherche
		if(sentence.length !== 0){
		    MathKeyword.searchBySentence(sentence,ended,function(err,elts,completions){
			if(err) return next(err)
			if(elts.length !==0){
			    //on filtre les résultats suivant tags et ancetres
			    var filtred_elts = Lodash.filter(elts,function(elt){
				return Lodash.intersection(elt.tagsName,tags).length == tags.length
				    && Lodash.intersection(elt.ancestors,ancestors).length == ancestors.length
			    })
			    
			    next(null,filtred_elts,completions)
			}
			else{
			    next(null,[],completions)
			}
		    });
		}
		else{
		    //on crée une version simplifiée des tags
		    var snakeTags = Lodash.map(tags,function(tagName){
			return Lodash.snakeCase(tagName)
		    })
		
		    if(snakeTags.length !==0){
			
			MathTag.find({ snakeName: {$all:snakeTags} }).populate('elements').exec(function(err,tags){
			    if(err) return next(err);
			    var elts = _.flatten(_.pluck(tags,"elements"));
			    if(elts.length !==0){
				var filtred_elts = Lodash.filter(elts,function(elt){
				    return Lodash.intersection(elt.ancestors,ancestors).length == ancestors.length
				});

				next(null,filtred_elts,[])
			    }
			    else{
				next(null,[],[])
			    }
			});
		    }
		    else{
			if(ancestors.length !==0){
			    MathElt.find({ancestors: {$all : ancestors}},function(err,elts){
				if(err) return next(err);
				next(null,elts,[])
			    })
			}
			else{
			    next(null,[],[]);
			}
			    
		    }
		}
	    })
	})
    },
    /*
     * Recherche les elts corresponds à une phrase 
     */
    searchBySentence: function(sentence,ended,next){
	//on limite le nombre de mots-clés à 6 
	var exprs = ConvertString.extractExpr(sentence).slice(0,6),
	    exprsTwoWords = ConvertString.addTwoWordsExpr(exprs),
	    keywords = Lodash.map(exprsTwoWords,function(expr){
		return Lodash.snakeCase(expr);
	    });
	
	var query = {or: Lodash.map(
	    ConvertString.choosesReadingExprs(exprs,ended),
	    function(reading){
		return {keywordsName: { $all: reading } };
	    })}

	MathElt.find(query,function(err,elts){
	    if(err) return next(err)
	    var key,cpt, scorePerElt={};
	    /*IL faut trier les résultats */

	    for(key=0;key < elts.length;key++){
		scorePerElt[elts[key].name] = 0;
		for(cpt=0;cpt<keywords.length;cpt++){
		    //si l'élement à un score pour un des mots issue de sentence
		    if(elts[key].scorePerKeyword[keywords[cpt]])
			scorePerElt[elts[key].name] += elts[key].scorePerKeyword[keywords[cpt]];
		    // si l'elt contient pour le mot clé, l'expression de sentence
		    if(Lodash.intersection(elts[key].exprPerKeyword[keywords[cpt]],exprsTwoWords).length !==0)
			scorePerElt[elts[key].name] += 50;
		}
	    }
	    //si la phrase de recherche n'est pas fini, on recherche les mots clée pour compléter la fin
	    if(!ended){
		var last_keyword = RegExp("^"+Lodash.snakeCase(exprs[exprs.length -1])+"(|s|x)[a-zA-Z]*_?[a-zA-Z]*$"),
		    last_double_keyword = Lodash.snakeCase("^"+exprsTwoWords[exprsTwoWords.length -1]+"(|s|x)[a-zA-Z]*$"),
		    completions = [];
		
		for(key=0;key < elts.length;key++){
		    //on cherche parmi les 
		    for(cpt=0;cpt<elts[key].keywordsName.length;cpt++){
			//si le keyword correspond à l'un des last_ last_double
 			var match = elts[key].keywordsName[cpt].match(last_keyword),
			    match_double = elts[key].keywordsName[cpt].match(last_double_keyword)
			
			if(match){
			    //on fait le cumul des scores
			    var completion_single = exprs.slice(0,exprs.length - 1).join(" ")+" " + elts[key].exprPerKeyword[match.input];
			    if(completions[completion_single])
				completions[completion_single] += elts[key].scorePerKeyword[match.input]
			    else
				completions[completion_single] = elts[key].scorePerKeyword[match.input]
			}
			    if(match_double){
				var completion_double= exprs.slice(0,exprs.length - 2).join(" ")+" " + elts[key].exprPerKeyword[match_double.input];
				if(completions[completion_double])
				    completions[completion_double] += elts[key].scorePerKeyword[match.input]
				else
				    completions[completion_double] = elts[key].scorePerKeyword[match.input]
			    }
			 
		    }
		}
		
		//on retire les doublons et les petits mots
		completions = Object.keys(completions).sort(function(a,b){ return completions[b] -completions[a]})

	    }

	    elts.sort(function(a,b){ return scorePerElt[b.name]-scorePerElt[a.name]})
	    next(null,elts,completions);
	})
    }
};

