var sm = require('sitemap');
var sitemap = sm.createSitemap({
    hostname: sails.config.variables.general.host,
    cacheTime: 600000
}); 

var mathURL = '/math/elt/';
module.exports = {
    initMath : function(){
	MathElt.find({},function(err,elts){
	    elts.forEach(function(elt){
		sitemap.add({url: mathURL+elt.name});
	    });
	});
    },
    addMath : function(elt){
	sitemap.add({url: mathURL+elt.name});
    },
    updateMath : function(elt,old_elt){
	if(elt.name != old_elt.name){
	    sitemap.del(mathURL + old_elt.name);
	    sitemap.add({url: mathURL + elt.name});
	}
	
    },
    getXML : function(next){
	sitemap.toXML(function(err,xml){
	    next(err,xml);
	});
    },
    getObject : function(next){
	next(sitemap);
    },
    getString : function(next){
	next(sitemap.toString());
    }
}
