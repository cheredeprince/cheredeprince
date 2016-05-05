/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    new: function(req,res){
	res.view();
	
    },
    create: function(req,res, next){

	var values ={ // on empeche de creer un compte admin
	    name: req.param('name'),
	    password: req.param('password'),
	    email: req.param('email')
	}

	User.create(values, function(err,user){
	    if(err){
		console.log(err);
		req.session.flash ={
		    err: [{message:JSON.stringify(err)}]
		}
		return res.redirect('/user/new');
	    }else{
		//socket
		var createdData = {
		    id: user.id,
		    name: user.name,
		    email: user.email,
		    admin: user.admin
		}
		User.publishCreate(createdData)
		
		res.redirect('/session/new');
	    }
	})
    },

    show: function(req,res,next){
	User.findOne(req.param('id'), function(err,user){
	    if(err) return next(err);
	    if(!user) return next('l\' utilisateur n\'existe pas');
	    else{
		res.view({user: user})
	    }
	})
    },

    index: function(req, res, next){
	User.find(function(err,users){
	    if(err) next(err)
	    else{
		res.view({
		    users: users
		})
	    }
	})
    },

    edit: function(req,res,next){
	User.findOne(req.param('id'),function(err,user){
	    if(err) next(err)
	    else{
		res.locals.user = user
		res.view()
	    }
	})
    },
    update: function(req,res,next){
	var values = req.params.all();
	if(req.session.User.admin){ //si l'utilisateur est un admin
	    //on convertie les données de la checkbox admin
	    if(typeof values.admin !== 'undefined'){
		if(values.admin === 'unchecked')
		    values.admin = false
		else if(values.admin[1] === 'on')
		    values.admin = true
	    }
	}else if(typeof values.admin !== 'undefined') //si non-admin on supprime la valeur admin
	    values.admin = null;
	
	User.update(req.param('id'),values,function(err,users){
	    if(err){
		console.log(err);
		req.session.flash = {
		    err: [{message:JSON.stringify(err)}]
		}
		res.redirect('/user/edit/'+req.param('id'))
	    }else{
		res.redirect('/user/show/'+ req.param('id'))
		//socket
		var attrs = ['name','email','admin']
		attrs.forEach(function(attrName){
		    var updatedData = {
			attr: attrName,
			id: users[0].id
		    }
		    updatedData[attrName] = users[0][attrName]
		    User.publishUpdate(users[0].id,updatedData)
		})

	    } 
	})
    },

    destroy: function(req, res, next){
	User.findOne(req.param('id'), function(err,user){
	    if(err) next(err)
	    else{ if(! user) next('l\' utilisateur n\'existe pas')
		  else{
		      user.destroy(function(err){
			  if(err) next(err)
			  else{
			      res.redirect('/user/')

			      //socket
			      User.publishDestroy(user.id)
			  }
		      })
		  }
		}
	})
    },

    subscribe: function(req, res,next){
	User.find(function(err,users){
	    if(err) return next(err)
	    User.watch(req.socket)
	    User.subscribe(req.socket, users)	    
	})
    }
};

