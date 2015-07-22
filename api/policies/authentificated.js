module.exports = function(req,res,next){
    
if(req.session.authentificated)
	next()
    else{
	req.session.flash ={
	    err: [{name:"requireLogin",message:"Tu dois être connecté !"}]
	}
	res.redirect('/session/new')
    }
}
