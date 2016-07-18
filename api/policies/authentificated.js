module.exports = function(req,res,next){
    
if(req.session.authentificated)
    next();
    else{
	req.session.flash ={
	    err: [{name:"requireLogin",message:"Tu dois être connecté !"}]
	};
        if(res.redirect)
	    res.redirect('/session/new');
        else
            res.json({err: [{name:"requireLogin",message:"Tu dois être connecté !"}]});
    }
}
