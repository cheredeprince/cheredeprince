module.exports= function(req,res,next){
    var page = 'all',
        pages = ['accueil','math','blog','contact'],
        ctrl = req.route.path.split('/')[1];

    if(pages.indexOf(ctrl) != -1)
        page = ctrl;


    Leadin.findByPage(page,function(err,leadin){
        if(err) return next(err);
        if(!leadin){
            leadin = {contentHTML: ""};
        }
        res.locals.leadInPage = leadin;
        next();
    });

};
