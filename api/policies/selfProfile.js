module.exports = function(req,res,ok){
    var selfPage = req.param('id') == req.session.User.id,
	isAdmin = req.session.User.admin;
    if(!(isAdmin || selfPage)){
	req.session.flash = {
	    err : [{name: "AdminRequired",message:"Tu as besoin des droits d'administrateur."}]
	}
	res.redirect('/session/new')
    }else
	ok()
	
}
