xmodule.exports= function(req,res,next){

    res.locals.flash= {};

    if(!req.session.flash)
        return next();
    else
        res.locals.flash = _.clone(req.session.flash)
    req.session.flash ={};
    next();
}
