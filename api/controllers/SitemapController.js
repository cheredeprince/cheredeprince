/**
 * SitemapController
 *
 * @description :: Server-side logic for managing tags
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    index: function(req,res,next){
	Sitemap.getXML(function(err,xml){
	    if(err) return res.serverError(err);
	    res.header('Content-Type', 'application/xml');
	    res.end( xml );
	});
    }    
};
