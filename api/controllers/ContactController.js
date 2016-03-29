/**
 * ContactController
 *
 * @description :: Server-side logic for contact page
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    index: function(req,res,next){
	res.view({contact:{}});
    },
    envoi: function(req,res,next){

	var name   = req.param('contact-name'),
	    email  = req.param('contact-email'),
	    url    = req.param('contact-url'),
	    message= req.param('contact-message');

	
	//ni le nom ni l'email
	if(!name && !email){
	    req.session.flash={
		err: [{name:"nameEmailRequired",message:"J'ai besoin de ton nom et de ton email."}]
	    };
	    res.view('contact/index.ejs',{contact:{message : message,
						   url     : url}
					 });
	    //email,mais pas le nom
	} else if(!name){
	    req.session.flash={
		err: [{name:"nameRequired",message:"Tu as bien un nom ou un pseudo, pour moi ?"}]
	    };
	    res.view('contact/index.ejs',{contact:{message: message,
						   email  : email,
						   url    : url
						  }
					 });
	    //nom, mais pas email
	    res.redirect('/contact');
	} else if(!email){
	    req.session.flash={
		err: [{name:"emailRequired",message:"Comment veux-tu, que je te réponde sans ton email ? Filou, va !"}]
	    };
	    res.view('contact/index.ejs',{contact:{message : message,
						   name    : name,
						   url     : url
						  }
					 });
	    // tout
	} else{	    
	    Mail.sendMessage(name,email,url,message,function(err){
		if(err){
		    req.session.flash={
			err: [{name:"EnvoiImpossible",message:"Oups ! Une erreur s'est produite lors de l'envoi. Essaie encore ou envoie-moi le mail directement à becasse@cheredeprince.net"}]
		    };
		    res.view('contact/index.ejs',{contact:{message : message,
							   name    : name,
							   email   : email,
							   url     : url
							  }
						 });
		}else {
		    req.session.flash={
			err: [{name:"EnvoiEffectue",message:"Le facteur est passé, et je te répondrais"}]
		    };
		    res.redirect('/contact');
		}
	    });
	}
    }
};

