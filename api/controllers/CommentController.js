/**
 * CommentController
 *
 * @description :: Server-side logic for managing comments
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    index: function(req,res,next) {
	Comment.findByArticle(function(err,arts){
	    if(err) return next(err)
	    
	    res.view({arts: arts})
	})
    },
    create: function(req, res, next){

	var articleName = req.param('article');
	console.log(articleName)
	// on récupère les valeurs utiles à la création
	Blog.findOne({name: articleName}).populate('author').exec(function(err,art){

	    if(err) return next(err);

	    var values = {
		pseudo: req.param('pseudo'),
		email: req.param('email'),
		site: req.param('site'),
		contentBB: req.param('contentBB'),
		article: (!art)?undefined:art.id,
		responseTo: req.param('responseto')
	    }
	    
	    Comment.create(values,function(err,comment){
		if(err){
		    console.log(err)
		    req.session.flash= {
			err: [{message: JSON.stringify(err)}]
		    }
		    res.redirect('/blog/show/'+art.name+'#comments-form')			
		}else{
		    var subject = values.pseudo+" vient de commenter "+art.title,
			message = comment.contentHTML;
		    
		    if(!art.author || art.author.name !== 'La Bécasse')
			Mail.sendLog(subject,message,function(err){
			})
		    if(art.author && art.author.email)
			Mail.sendTo(subject,message,art.author,function(err){
			})
		    res.redirect('/blog/show/'+art.name+'#comments-form')		
		}
	    })
	})
    },

    valid: function(req,res,next){

	Comment.findOne(req.param('id'),function(err,comment){
	    if(err) return next(err)
	    if(!comment) return next()
	    
	    comment.status = 'valid';
	    comment.save(function(err){
		if(err) return next(err)
		res.redirect('/comment')
	    })
	})
    },

    
    refuse: function(req,res,next){

	Comment.findOne(req.param('id'),function(err,comment){
	    if(err) return next(err)
	    if(!comment) return next()

	    comment.status = 'refused';
	    comment.save(function(err){
		if(err) return next(err)
		res.redirect('/comment')
	    })
	})
    },    
    destroy:function(req,res,next){
		
	Comment.findOne(req.param('id'),function(err, comment){
	    if(err) return next(err)
	    if(!comment){
		
		req.session.flash={
		    err:[{name:'nocomment',message:"Ce commentaire n'existe pas"}]
		}
		res.redirect('/comment/')
	    }else{
		Comment.destroy(comment.id,function(err){
		    if(err) return next(err)
		    console.log("Le commentaire "+comment.id+" est supprimé")
		    res.redirect('/comment')
		})

	    }
	})
    }
    
};
