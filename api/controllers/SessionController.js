/**
 * SessionController
 *
 * @description :: Server-side logic for managing sessions
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    
    new: function(req,res){
	res.view();
    },
    create: function(req,res,next){
	if(!req.param('name') || !req.param('password')){
	    req.session.flash={
		err: [{name:"usernamePasswordRequired",message:"Le nom et le mot de passe sont requis."}]
	    }
	    res.redirect('/session/new')
	    
	}else{

	    User.findOne({name:req.param('name')},function(err,user){
		if(err) return next(err)

		if(!user){
		    req.session.flash ={
			err: [{name:"noAccount",message:"Le nom "+req.param('name')+" est inconnu des registres"}]
		    }
		    return res.redirect('/session/new')
		}

		require("bcrypt").compare(req.param('password'),user.pass,function(err,valid){
		    if(err) return next(err)

		    if(!valid){
			req.session.flash = {
			    err: [{name:"usernamePasswordmMismatch",message:"Authentification invalide"}]
			}
			return res.redirect('/session/new')
		    }
		    //connection de l'utilisateur
		    req.session.authentificated = true
		    req.session.User = user
		    //inform socket
		    User.publishUpdate(user.id,{
			attr:'loggedIn',
			loggedIn: true,
			id: user.id
		    })
		    //changer le status en ligne de l'utilisateur
		    user.online = true;
		    user.save(function(err,user){
			if(err) return next(err);
			res.redirect('/user/show/'+ user.id)
		    })
		  
		})
	    })
	}
    },

    destroy: function(req,res, next){
	User.findOne(req.session.User.id,function(err,user){
	    if(err) return next(err)
	    // edit session 
	    req.session.destroy();
	    //inform socket
	    User.publishUpdate(user.id,{
		attr: "loggedIn",
		loggedIn: false,
		id: user.id
	    })
	    //edit user
	    user.online = false;
	    user.save(function(err,user){
		if(err) return next(err);
		res.redirect('/session/new');
	    })	    
	})
}
};

