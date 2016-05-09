module.exports = function(req,res,next){

    var model = req.route.path.split('/')[1],
        supportedModel = ['user','session','blog','math','contact',''];
    if(supportedModel.indexOf(model) >-1){
        req.session.modelUse = model

        next()
    }else{
        req.session.modelUse = null;
        next()
    }
}
