/**
 * TagController
 *
 * @description :: Server-side logic for managing tags
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    index: function(req,res,next){
	Tag.find(function(err,tags){
	    if(err) return next(err)

	    res.view({tags : tags})
	})
    },
    
    new: function(req,res,next){
	res.view();
    },
    
    create:  function(req,res,next){
	Tag.create({name: req.param('name')},function(err,tag){
	    if(err) return next(err)

	    if(res.redirect)
		res.redirect('/tag/')
	    else
		res.json(tag)
	})
    },
    
    destroy:function(req,res,next){

	Tag.findOne(req.param('id')).populate('articles').exec(function(err, tag){
	    if(err) return next(err)
	    if(!tag){
		req.session.flash={
		    err:[{name:'noTag',message:"Ce Tag n'existe pas"}]
		}
		res.redirect('/tag')
		
	    }else if(tag.articles.length !==0){
		req.session.flash={
		    err:[{name:'stillArticle',message:"Ce Tag est encore rattaché à des articles"}]
		}
		res.redirect('/tag')
		
	    }else
		Tag.destroy(tag.id,function(err){
		    if(err) return next(err)
		    console.log("Le tag "+ tag.name+" est supprimé")
		    res.redirect('/tag')
		})
	})
    }    
};

