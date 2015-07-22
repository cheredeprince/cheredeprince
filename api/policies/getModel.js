module.exports = function(req,res,next){
    
    var model = req.route.path.split('/')[1],
	supportedModel = ['user','session','blog'];
    console.log(model)
    if(supportedModel.indexOf(model) >-1){
	req.session.modelUse = model
	next()
    }else{
	delete req.session.modelUse
	next()
    }
}
