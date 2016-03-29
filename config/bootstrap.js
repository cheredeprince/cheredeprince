/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.bootstrap.html
 */

module.exports.bootstrap = function(cb) {


    sails.config.csrf.routesDisabled = '/blog/uploadBanner,/blog/uploadSticker,/blog/uploadImage'
  // It's very important to trigger this callback method when you are finished
    // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)

    /*Generer la liste des tags favoris*/
    Tag.findFavoriteTags();
    // Générer le sitemap des maths
    Sitemap.initMath();



    var Lodash = require('lodash');
    MathOld.find({},function(err,elts){
	if(elts.length == 0)
	    cb();
//	console.log(elts);
	var elts = _.filter(elts,function(elt){
	    return elt.content;
	})
	var parentLess = _.filter(elts,function(elt){
	    
	    return elt.content && elt.content.parents.length == 0;	   
	})
	var elt,parent;
	for(elt=0;elt<elts.length;elt++){
	    if(elts[elt].content)
	    for(parent =0;parent< elts[elt].content.parents.length;parent++){
		elts[elt].content.parents[parent] = elts[elt].content.parents[parent].toString();
	    }
	}

	var eltsMap = {};
	_.each(elts,function(elt){
	    eltsMap[elt.id] = elt;
	})

	
	var aSync = function(ancestorsName){

	    if(ancestorsName.length == elts.length)
		return ancestorsName;
	    var descendants = (ancestorsName.length ==0)?parentLess:_.filter(elts,function(elt){
		return ancestorsName.indexOf(elt.id) == -1 && _.intersection(elt.content.parents,ancestorsName).length == elt.content.parents.length;
	    });
	    
	    var add = _.map(descendants,function(des){
		var parentsString= '';
		_.each(des.content.parents,function(parentId){ parentsString += ' @'+ Lodash.snakeCase( eltsMap[parentId].content.title.slice(0,20))})
		return {name: Lodash.snakeCase(des.content.title.slice(0,20)),title:des.content.title,type: (des.content.type)?des.content.type: 'def',content:parentsString+' ' +des.content.tree.children.cont.content}
	    })
	    
	   
	    

	    var cpt = 0;
	    var pas = function(){
		var go = false
		setTimeout(function(){if(!go){console.log(add[cpt])}},10000)
	    	MathElt.createElt(add[cpt],function(err){
	    	    if(!err){ 
		    go = true;
		    //console.log(cpt)
	    	    cpt++;
	    	    if(cpt == add.length)
	    		aSync(_.union(_.pluck(descendants,"id"),ancestorsName))
		    else
			pas();}
		    else
			console.log(err);
	    	})
	    }
	    pas()
	}
	//aSync([]);
    })

    
  cb();
};
