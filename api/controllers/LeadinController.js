/**
 * LeadinController
 *
 * @description :: Server-side logic for managing leadins
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    index: function(req,res,next){
	Leadin.find().sort('createdAt DESC').exec(function(err,leadIns){
	    if(err) return next(err)
	    ModelAssets.arraytoOBJ(leadIns,function(){
		res.view({leadIns: leadIns});
	    })
	})
    },

    new: function(req, res,next){
	res.view();
    },

    create: function(req, res, next){

	var pages = req.param('pages')

	if(!pages)
	    pagesUp = ['rien'];
	else if( typeof pages != 'object' || !pages.length )
	    pagesUp = new Array(pages)
	else
	    pagesUp = pages

	// on récupère les valeurs utiles à la création
	var values = {
	    contentBB: req.param('contentBB'),
	    pages: pagesUp
	}

	Leadin.create(values,function(err,leadin){
	    if(err){
		console.log(err)
		req.session.flash= {
		    err: [{message: JSON.stringify(err)}]
		}
		return res.redirect('leadin/new')
	    }else{
		res.redirect('/leadin/')
	    }
	})
    },

    edit: function(req,res,next){

	Leadin.findOne( req.param('id')).exec(
	    function(err,leadin){
		if(err) return next(err)
		if(!leadin){
		    req.session.flash={
			err:[{name:'noLeadIn',message:"Cette accroche n'existe pas"}]
		    }
		    res.redirect('/leadin/new')
		}else
		    res.view({leadin: leadin.toOBJ()})
	    })
    },

    update: function(req,res,next){

	var pages = req.param('pages')

	if(!pages)
	    pagesUp = ['rien'];
	else if( typeof pages != 'object' || !pages.length )
	    pagesUp = new Array(pages)
	else
	    pagesUp = pages


	var values = {
	    id: req.param('id'),
	    contentBB: req.param('contentBB'),
	    pages: pagesUp
	}

	Leadin.update(req.param('id'),values, function(err,leadin){
	    if(err){
		console.log(err)
		req.session.flash = {
		    err:[{message: JSON.stringify(err)}]
		}
		res.redirect('/leadin/edit/'+req.param('id'));
	    }else{
		res.redirect('/leadin')
	    }
	})
    },

    destroy:function(req,res,next){

	Leadin.findOne(req.param('id'),function(err, leadin){
	    if(err) return next(err)
	    if(!leadin){

		req.session.flash={
		    err:[{name:'noleadin',message:"Cette accorche n'existe pas"}]
		}
		res.redirect('/leadin/new')
	    }else{
		Leadin.destroy(leadin.id,function(err){
		    if(err) return next(err)
		    console.log("L'accroche "+leadin.id+" est supprimé")
		    res.redirect('/leadin')
		})

	    }
	})
    }

};
