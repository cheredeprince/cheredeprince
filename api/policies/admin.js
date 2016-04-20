module.exports = function(req,res,ok){

    if(req.session.User && req.session.User.admin)
	ok();
    else{
	req.session.flash = {
	    err: [{name: "AdminRequire",message:"Tu as besoin des droits d'administrateur"}]
	};

	res.redirect('/session/new')
    }
}
