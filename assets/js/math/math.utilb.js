/*
 * math.utilb.js
 * General Javascript utilities for Browser
 */

math.utilb = (function(){
    var simpleDate, truncate;

    /*
     * Cette fonction transforme un object date en un string représentant la date du jour en français
     * args :    *  date : un object Date 
     * returns : *  un string
     * throw: none
     */
    simpleDate = function(date){
	var stringDate = '',
	    monthsName  = ['janv.', 'févr.', 'mars', 'avril', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
	stringDate = date.getDate()+' ';
	stringDate += monthsName[date.getMonth()] + ' ';
	stringDate += date.getFullYear();

	return stringDate;
    };

    truncate = function(html, length){
	var getOpenTag,
	    getCloseTag,
	    step,
	    tagsPile = [],
	    trunc = '',
	    tail = html,
	    error = false;

	//si le texte n'est pas trop long, on ne fait rien
	if(html.length < length)
	    return html;

	
	getOpenTag = function(tag){	    
	    if(tag.match(/<\/[a-z]+>/i)){
		return '<'+tag.slice(2,tag.length-1)+'>'
	    }else{
		return undefined;
	    }
	}

	getCloseTag = function(tag){	    
	    if(tag.match(/<[a-z]+>/i)){
		return '</'+tag.slice(1,tag.length-1)+'>'
	    }else{
		return undefined;
	    }
	}	

	var match,index, tag = '', last;


	    
	while( tail.length > 0 && trunc.length +tag.length< length && !error){
	    //on ajoute le tag précédent
	    trunc += tag;

	    match = tail.match(/<\/?[a-z]+>/i);

	    if(match){
		index = match.index;
		tag = match[0];
		last = tagsPile.pop();


		if(!last || getOpenTag(tag) !== last){
		    if(last)
			tagsPile.push(last);
		    tagsPile.push(tag);
		    //si on a un fermant non ouvert
		    if(getOpenTag(tag)){
			error = true; 
		    }
		}
		trunc += tail.slice(0,Math.min(length - trunc.length,index))
		
		tail = tail.slice(tag.length+index,tail.length) 
	    }else{
		trunc += tail.slice(0, length - trunc.length)
	    }
	    
	}
	// en cas d'erreur on revoie le texte originel
	if(error)
	    return html;

	
	// on referme le latex
	var $$InitMatch = html.match(/\$\$/g),
	    $$TruncMatch = trunc.match(/\$\$/g);

	if($$InitMatch && $$TruncMatch && $$InitMatch.length %2 == 0 && $$TruncMatch.length% 2 !==0){
	    //si on a coupé le dernier $$ fermant
	    if(trunc[trunc.length -1] == '$'){
		trunc += '$'
	    }else{
		//on supprime la dernière partie
		var splited = trunc.split('$$')

		trunc = splited.slice(0,splited.length -1).join('$$')
	    }
	}
	
	
	
	var $InitMatch = (' '+html +' ').match(/([^\$]|\s|\w|\b)\$([^\$]|\w|\b|\s)/g),
	    $TruncMatch = (' '+trunc +' ').match(/([^\$]|\s|\w|\b)\$([^\$]|\w|\b|\s)/g);

	if($TruncMatch && (!$InitMatch || $InitMatch.length %2 == 0) && $TruncMatch.length% 2 !==0){
	    //on a coupé un $$ ouvrant
	    if(trunc[trunc.length -1] == '$'){
		trunc = trunc.slice(0, trunc.length - 1)
	    }else{
		//on supprime la dernière partie
		var splited = trunc.split('$')
		trunc = splited.slice(0,splited.length -1).join('$')
	    }
	}

	//on ajoute l'ellipse

	trunc += ' ...'
	
	// on a un tag fermant
	if(getOpenTag(tag)){
	    trunc += tag;
	}
	// on ferme tous les tags ouverts
	var cpt;
	for(cpt = 0; cpt<tagsPile.length;cpt++){
	    var openedTag = tagsPile.pop();
	    trunc += getCloseTag(openedTag)
	}

	return trunc
    }



    
    return{
	simpleDate : simpleDate,
	truncate   : truncate
    }
}());
