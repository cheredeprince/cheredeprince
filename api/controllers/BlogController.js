/**
 * BlogController
 *
 * @description :: Server-side logic for managing blogs
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var display =function(req,res,next,query,page,pageName,subject){

    var page = parseInt(page)
    if(isNaN(page) || page == 0)
        return res.notFound();

    query.published = true;

    Blog.count(query,function(err,artNumber){
        if(err) return next(err)
        Blog.find({where:query,skip:(page-1)*5,limit:5,sort:{publishedAt:0}}).populate('tags').populate('author').exec(function(err,arts){
            if(err) return next(err);
            if(arts.length == 0)
                return res.notFound()
            else
                ModelAssets.arraytoOBJ(arts,function(){

                    var pageMeta={
                        title: "Blog",
                        section:'blog',
                        name:'index'
                    }
                    res.view('blog/index.ejs',{arts: arts, tagsList: Tag.favoriteTags,lastPage: (page)*5 +1 > artNumber, firstPage: page ==1, pageNumber: page,pageName:pageName,subjectName:subject,page:pageMeta})				})
        })
    })
}


module.exports = {

    index: function(req,res,next){

        if(req.param('page') == 1)
            return res.redirect('/blog')

        var page = (req.param('page'))? req.param('page'):1;

        display(req,res,next,{},page)
    },

    category: function(req,res,next){
        if(req.param('page') == 1)
            return res.redirect('/blog/category/'+req.param('name'))

        var page = (req.param('page'))? req.param('page'):1,
            name = (typeof req.param('id') == 'string')? req.param('id'):'';

        display(req,res,next,{category: name},page,'category',name)
    },

    show: function(req,res,next){

        console.log(req.params,req.param('id'),req.param('p'));
        var query={}
        if(req.param('id'))
            query = {name:req.param('id')}
        else
            query = {id:req.param('p')}

        Blog.findOne(query).populate('comments').populate('tags').populate('author').exec(function(err,art){ //req.param('id') is the last word of the URL
            if(err) return next(err)
            if(!art){
                req.session.flash={
                    err:[{name:'noArticle',message:"Cet article n'existe pas"}]
                }
                res.notFound()
            }else{

                var page={
                    title: art.title +" - Blog",
                    name: 'show',
                    section: 'blog'
                }

                art.findRelatedArts(function(relatedArts){
                    Comment.findForArticle(art.id,function(err,comments){
                        if(err) return next(err)
                        res.view({art : art.toOBJ(), relatedArts: relatedArts,comments:comments,tagsList: Tag.favoriteTags,page:page})
                    })

                })
            }
        })
    },

    new: function(req, res,next){
        res.view();
    },

    create: function(req, res, next){
        // on récupère les valeurs utiles à la création
        var values = {
            name: req.param('name'),
            title: req.param('title'),
            category: req.param('category'),
            author: (req.session.User)? req.session.User.id: ''
        }

        Blog.create(values,function(err,art){
            if(err){
                console.log(err)
                req.session.flash= {
                    err: [{message: JSON.stringify(err)}]
                }
                return res.redirect('blog/new')
            }else{
                res.redirect('/blog/edit/'+art.name)
            }
        })
    },

    edit: function(req,res,next){
        Blog.findOne({name: req.param('id')}).populate('tags').exec(
            function(err,art){
                if(err) return next(err)
                if(!art){
                    req.session.flash={
                        err:[{name:'noArticle',message:"Cet article n'existe pas"}]
                    }
                    res.redirect('/blog/new');
                }else
                    res.view({art:art});
            });
    },

    update: function(req,res,next){
        var values = {
            id: req.param('id'),
            name: req.param('name'),
            title: req.param('title'),
            category: req.param('category'),
            published: (!req.param('published'))? false:req.param('published')==='on' ,
            presentation: req.param('presentation'),
            introBB: req.param('introBB'),
            textBB: req.param('textBB')
        }

        Blog.findOne(req.param('id')).populate('author').exec(function(err,OldArt){

            Blog.update(req.param('id'),values, function(err,art){
                if(err){
                    console.log(err)
                    req.session.flash = {
                        err:[{message: JSON.stringify(err)}]
                    }
                    if(res.redirect)
                        res.redirect('/blog/edit/'+ art[0].name)
                    else
                        res.json({
                            err:[{message: JSON.stringify(err)}]
                        })
                }else{

                    if(art[0].published && !OldArt.published){
                        RSS.addArticle(art[0])
                        if(res.redirect)
                            res.redirect('/blog/show/'+art[0].name)
                        else
                            res.json()
                    }else{
                        if(res.redirect)
                            res.redirect('/blog/edit/'+ art[0].name)
                        else
                            res.json()
                    }
                }
            })
        })

    },

    list: function(req,res,next){
        Blog.find({sort:{createdAt:0}},function(err,arts){
            if(err) return next(err)

            ModelAssets.arraytoOBJ(arts,function(){
                res.view({arts: arts})
            })

        })
    },

    destroy:function(req,res,next){
        var confirmed = req.param('confirm') == 'on';
        Blog.findOne(req.param('id'),function(err,art){
            if(err) return next(err)
            if(!art){
                req.session.flash={
                    err:[{name:'noArticle',message:"Cet article n'existe pas"}]
                }
                res.redirect('/blog/new')

            }else if(!confirmed){

                res.redirect('/blog/list')
            }else if(art.published){

                req.session.flash={
                    err:[{name:'Published',message:"Cet article est en cours de publication et de ne peut être supprimé"}]
                }
                res.redirect('/blog/new')
            }else{
                var filesPath = sails.config.appPath+'/assets/images/blog/'+art.name;
                require('rimraf')(filesPath,function(err){
                    if(err) return next(err)
                    Blog.destroy(art.id,function(err){
                        if(err) return next(err)
                        console.log("L'article "+art.name+" est supprimé")
                        res.redirect('/blog/list')
                    })
                })
            }
        })
    },


    /*
     * Tags Controllers
     */


    editTags: function(req,res,next){

        Blog.findOne({name: req.param('id')}).populate('tags').exec(function(err,art){
            if(err) return next(err)

            var makeUpTags = function(tags,next){
                var tagsUp = {}
                var cpt = 0;
                if(tags.length ==0)
                    next(tagsUp)
                tags.forEach(function(tag){
                    tagsUp[tag.name] = true;
                    cpt++;
                    if(cpt == tags.length)
                        next(tagsUp)
                })
            }
            if(!art){
                req.session.flash={
                    err:[{name:'noArticle',message:"Cet article n'existe pas"}]
                }
                res.redirect('/blog/new')

            }else

                Tag.find(function(err,tags){
                    if(err) return next(err)
                    makeUpTags(art.tags,function(tagsUp){
                        art.tagsUp = tagsUp;
                        res.view({tags: tags, art: art})
                    })

                })
        })
    },

    updateTags: function(req,res,next){

        var idsList = req.param('idTag')

        if(!idsList)
            idsListUp = [];
        else if( typeof idsList != 'object' || !idsList.length )
            idsListUp = new Array(idsList)
        else
            idsListUp = idsList

        Blog.findOne({name: req.param('id')}).populate('tags').exec(function(err,art){
            if(err) return next(err)

            if(!art){
                req.session.flash={
                    err:[{name:'noArticle',message:"Cet article n'existe pas"}]
                }
                res.redirect('/blog/new')
            }

            art.setTags(idsListUp,function(err){
                if(err) return next(err)
                art.save(function(err,artSaved){
                    res.redirect('/blog/editTags/'+art.name)
                })
            })
        })
    },

    tag: function(req,res,next){

        if(req.param('page') == 1)
            return res.redirect('/blog/tag/'+req.param('id'))

        var page = (req.param('page'))? req.param('page'): 1,
            name = req.param('id');

        Tag.findOne({name: req.param('id')}).populate('articles').exec(function(err,tag){

            if(err) return next(err)

            if(!tag){
                req.session.flash={
                    err:[{name:'noTag',message:"Ce tag n'existe pas"}]
                }
                return res.redirect('/tag')
            }
            var keepOneAttr = function(list,attrName,next){
                var cpt=0,
                    result = [];
                if(list.length == 0)
                    next(result)
                list.forEach(function(obj){
                    result.push(obj[attrName])
                    cpt ++
                    if(cpt==list.length)
                        next(result)
                })
            }
            keepOneAttr(tag.articles,'id',function(idsArt){
                display(req,res,next,{id:idsArt},page,'tag',name)
            })

        })
    },
    /*
     * Banner Control
     */

    newBanner: function(req,res,next){
        Blog.findOne({name:req.param('id')},function(err,art){
            if(err) return next(err)
            if(!art){
                req.session.flash={
                    err:[{name:'noArticle',message:"Cet article n'existe pas"}]
                }
                res.redirect('/blog/new')
            }else{
                var args = {
                    title: 'Bannière',
                    uploadCtrl: 'uploadBanner',
                    artId: art.id
                }

                res.view('blog/upload',{args:args})
            }
        })
    },
    uploadBanner: function(req,res,next){
        res.locals['_csrf'] = ''
        var params = req.allParams()
        console.log(params)
        params.id = params.id.slice(1)
        Blog.findOne(params.id,function(err,art){
            if(err) return next(err)
            if(!art){
                req.session.flash={
                    err:[{name:'noArticle',message:"Cet article n'existe pas"}]
                }
                res.redirect('/blog/newBanner')
            }else{
                var upFile = req.file('image'),
                    dir = 'assets/images/blog/'+art.name+'/b',
                    formats = ['svg'],
                    desName = 'original',
                    formLink = '/blog/newBanner/'+art.name,
                    options = [
                        {
                            name: 'original',
                            ext:'png'
                        },
                        {
                            name: 'little',
                            ext: 'png',
                            width: 500
                        }
                    ]
                UploadImg(req,res,upFile,dir,formats,desName,formLink,options,function(err){
                    art.banner = true;
                    art.altBanner = params.alt;
                    art.save(function(err,artUpdated){
                        res.redirect('/blog/edit/'+art.name)
                    })
                })
            }
        });

    },

    /*
     * Sticker Control
     */

    newSticker: function(req,res,next){
        Blog.findOne({name:req.param('id')},function(err,art){
            if(err) return next(err)
            if(!art){
                req.session.flash={
                    err:[{name:'noArticle',message:"Cet article n'existe pas"}]
                }
                res.redirect('/blog/new')
            }else{
                var args = {
                    title: 'vignette',
                    uploadCtrl: 'uploadSticker',
                    artId: art.id
                }

                res.view('blog/upload',{args:args})
            }
        })
    },
    uploadSticker: function(req,res,next){
        res.locals['_csrf'] = ''
        var params = req.allParams()

        params.id = params.id.slice(1)
        Blog.findOne(params.id,function(err,art){
            if(err) return next(err)
            if(!art){
                req.session.flash={
                    err:[{name:'noArticle',message:"Cet article n'existe pas"}]
                }
                res.redirect('/blog/newSticker')
            }else{
                var upFile = req.file('image'),
                    dir = 'assets/images/blog/'+art.name+'/s',
                    formats = ['svg'],
                    desName = 'original',
                    formLink = '/blog/newSticker/'+art.name,
                    options = [
                        {
                            name: 'original',
                            ext:'png'
                        }
                    ]
                UploadImg(req,res,upFile,dir,formats,desName,formLink,options,function(err){
                    art.sticker = true;
                    art.altSticker = params.alt;
                    art.save(function(err,artUpdated){
                        res.redirect('/blog/edit/'+art.name)
                    })
                })
            }
        });

    },

    /*
     * Images Control
     */

    newImage: function(req,res,next){
        Blog.findOne({name:req.param('id')},function(err,art){
            if(err) return next(err)
            if(!art){
                req.session.flash={
                    err:[{name:'noArticle',message:"Cet article n'existe pas"}]
                }
                res.redirect('/blog/new')
            }else{
                var args = {
                    name: true,
                    title: 'image',
                    uploadCtrl: 'uploadImage',
                    artId: art.id
                }

                res.view('blog/upload',{args:args})
            }
        })
    },
    uploadImage: function(req,res,next){
        res.locals['_csrf'] = ''
        var params = req.allParams()

        params.id = params.id.slice(1)
        Blog.findOne(params.id,function(err,art){
            if(err) return next(err)
            if(!art){
                req.session.flash={
                    err:[{name:'noArticle',message:"Cet article n'existe pas"}]
                }
                res.redirect('/blog/new');
            }if(!ConvertString.isValidURI(ConvertString.simply(params.name))){
                req.session.flash={
                    err:[{name:'noCorectName',message:"Le nom de l'image n'est pas correct"}]
                }
                res.redirect('/blog/newImage/'+art.name);
            }else{

                var upFile = req.file('image'),
                    dir = 'assets/images/blog/'+art.name,
                    formats = ['svg','png','jpg','gif'],
                    desName = ConvertString.simply(params.name),
                    formLink = '/blog/newImage/'+art.name,
                    options = [
                        {
                            name: ConvertString.simply(params.name)+'-little',
                            ext:'png',
                            width: 600,
                            ifOrignFormat:['png','svg']
                        },
                        {
                            name: ConvertString.simply(params.name)+'-medium',
                            ext:'png',
                            width: 1200,
                            ifOrignFormat:['png','svg']
                        },
                        {
                            name: ConvertString.simply(params.name)+'-little',
                            ext: 'jpg',
                            width: 600,
                            ifOrignFormat:['jpg']
                        },
                        {
                            name: ConvertString.simply(params.name)+'-medium',
                            ext: 'jpg',
                            width: 1200,
                            ifOrignFormat:['jpg']
                        },
                        {
                            name: ConvertString.simply(params.name)+'-light',
                            ext: 'jpg',
                            ifOrignFormat:['jpg']
                        },
                        {
                            name: ConvertString.simply(params.name),
                            ext:'png',
                            ifOrignFormat: ['svg']

                        }
                    ]

                UploadImg(req,res,upFile,dir,formats,desName,formLink,options,function(err,ext){
                    if(err) return next(err);
                    if(!art.images)
                        art.images= {};
                    art.images[ConvertString.simply(params.name)]={
                        ext: ext,
                        alt: params.alt
                    }

                    art.save(function(err,artUploaded){
                        if(err) return next(err);
                        res.redirect('/blog/edit/'+art.name);
                    })
                })
            }
        });

    },

    deleteImage: function(req,res,next){
        Blog.findOne(req.param('id'),function(err,art){
            if(err) return next(err);
            if(!art){
                req.session.flash={
                    err:[{name:'noArticle',message:"Cet article n'existe pas"}]
                };
                res.redirect('/blog/new');
            }else{
                var imgName = req.param('name');
                if(!art.images || !art.images[imgName]){
                    req.session.flash={
                        err:[{name:'noImage',message:"Cette image n'existe pas"}]
                    };
                    res.redirect('/blog/edit'+art.name);
                }else{
                    var endToRm =[];
                    switch(art.images[imgName].ext){
                    case 'jpg': endToRm = ['-light.jpg','-medium.jpg','-little.jpg','.jpg'];
                        break;
                    case 'png': endToRm = ['-medium.png','-little.png','.png'];
                        break;
                    case 'svg' : endToRm = ['-medium.png','-little.png','.png','.svg'];
                        break;
                    case 'gif' : endToRm = ['.gif'];
                        break;
                    }

                    var cpt= 0;

                    var rmNext = function(err,done){
                        if(err) return next(err);
                        if(cpt == endToRm.length){
                            done();
                        }else{
                            require('fs').unlink(sails.config.appPath+'/assets/images/blog/'+art.name+'/'+ imgName + endToRm[cpt],function(err){
                                cpt ++;
                                rmNext(err,done)
                            });
                        }
                    };

                    rmNext(null,function(){
                        art.images[imgName] = null;
                        art.save(function(err,artUpdated){
                            if(err) return next(err);
                            res.redirect('/blog/edit/'+ art.name);
                        })
                    })
                }
            }
        })
    }
};


function UploadImg(req,res,upFile,dir,formats,desName,formLink,options,next){

    if(arguments.length==8){
        var next = options;
        var options = [];
    }
    // formats supportés
    var supportedFormats = ['svg','png','jpg','gif'];

    upFile.upload(function (err, uploadedFiles) {
        if (err) return res.negotiate(err);
        // si on upload un nombre différent de 1
        if(uploadedFiles.length !==1){
            req.session.flash = {
                err:[{name:"wrongNumberOfFiles",message:"le nombre de fichiers n'est pas correct"}]
            };
            res.redirect(formLink);
        }else{

            var file = uploadedFiles[0],
                im = require('imagemagick'),
                fs = require('fs'),
                path = require('path'),
                gm = require('gm').subClass({imageMagick: true}),
                imageObj = gm(file.fd);

            imageObj.format(function(err,format){
                if(err) return next(err);
                imageObj.size(function(err,size){
                    if(err) return next(err);

                    var ext = format.toLowerCase();

                    //transform jpeg in jpg

                    if(ext == 'jpeg') ext= 'jpg';

                    var orignPath = path.join( sails.config.appPath, dir,desName +'.'+ ext);

                    // si le format du fichier uploadé n'est pas supporté ou n'est pas un de ceux attendu
                    if(supportedFormats.indexOf(ext)<0 || formats.indexOf(ext)<0){
                        req.session.flash = {
                            err:[{name:"wrongFile",message:"le format du fichier n'est pas correct"}]
                        };
                        res.redirect(formLink);
                    }else{

                        // on déplace le fichier
                        require('fs').rename(file.fd,orignPath,function(err){
                            if(err) return next(err);

                            var cptCall = 0;

                            if(options.length == 0)
                                return next(null,err);


                            options.forEach(function(option){
                                var imageObj = gm(orignPath);
                                if(!option.ifOrignFormat || option.ifOrignFormat.indexOf(ext) > -1){
                                    var opts = {
                                        srcPath: orignPath,
                                        dstPath: path.join(sails.config.appPath,dir, option.name+'.'+option.ext),
                                        width: (option.width)?Math.min(option.width,size.width): size.width,
                                        format: option.ext
                                    };

                                    if(ext == 'svg'){ //svgtopng only
                                        if(option.ext == 'png'){
                                            imageObj.resize(opts.width).write(opts.dstPath,function(err,stdout,stderr){
                                                if(err) return next(err);
                                                cptCall ++;
                                                if(cptCall == options.length)
                                                    return next(null,ext);
                                            });
                                        }else
                                            return next([{name:"unvalidParameter",message:"Impossible de transformer le svg en quelque chose d'autre que png"}]);
                                    }else if(supportedFormats.indexOf(option.ext)>-1){
                                        imageObj.resize(opts.width).write(opts.dstPath,function(err,stdout,stderr){
                                            if(err) return next(err);
                                            cptCall ++;
                                            if(cptCall == options.length)
                                                return next(null,ext);
                                        });
                                    }else
                                        return next([{name:"unvalidParameter",message:"Fomat de sortie non supporté"}])
                                }else{
                                    cptCall ++
                                    if(cptCall == options.length)
                                        return next(null,ext)
                                }
                            })
                        })
                    }
                })
            })
        }

    });
}


var makePublicLink = function(filePath,publicDir){
    // on crée un lien symbolique pour rendre le fichier disponible
    setTimeout(function(){
        var fileName = require('path').basename(filePath),
            publicPath = require('path').join(publicDir,fileName);
        require('fs').symlink(filePath,publicPath,function(err){
            console.log(err);
        });},1000);
};
