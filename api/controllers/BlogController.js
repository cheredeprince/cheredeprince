/**
 * BlogController
 *
 * @description :: Server-side logic for managing blogs
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    index: function(req,res,next) {
	Blog.find({limit:10},function(err,arts){
	    if(err) return next(err)

	    res.view({arts: arts})
	})
    },

    show: function(req,res,next){
	Blog.findOne({name:req.param('id')},function(err,art){ //req.param('id') is the last word of the URL
	    if(err) return next(err)
	    if(!art){
		console.log(req)
		req.session.flash={
		    err:[{name:'noArticle',message:"Cet article n'existe pas"}]
		}
		res.redirect('/blog/')
	    }else
		res.view({art : art})
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
	    category: req.param('category')
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
	Blog.findOne({name: req.param('id')},function(err,art){
	    if(err) return next(err)
	    if(!art){
		req.session.flash={
		    err:[{name:'noArticle',message:"Cet article n'existe pas"}]
		}
		res.redirect('/blog/new')
	    }else
		res.view({art:art})
	})
    },

    update: function(req,res,next){

	var values = {
	    id: req.param('id'),
	    name: req.param('name'),
	    title: req.param('title'),
	    category: req.param('category'),
	    published: req.param('published')==='on',
	    presentationBB: req.param('presentationBB'),
	    introBB: req.param('introBB'),
	    textBB: req.param('textBB')
	}
	
	Blog.update(req.param('id'),values, function(err,art){
	    if(err){
		console.log(err)
		req.session.flash = {
		    err:[{message: JSON.stringify(err)}]
		}
		res.redirect('/blog/edit/'+ art[0].name)
	    }else{
		res.redirect('/blog/show/'+art[0].name)
	    }
	})
    },
    
    list: function(req,res,next){
	Blog.find(function(err,arts){
	    if(err) return next(err)
	    
	    res.view({arts: arts})
	})
    },
    
    destroy:function(req,res,next){
	var confirmed = req.param('confirm') == 'on';
	Blog.findOne(req.param('id'),function(err,art){
	    if(err) return next(err)
	    if(!art){
		console.log("a")
		req.session.flash={
		    err:[{name:'noArticle',message:"Cet article n'existe pas"}]
		}
		res.redirect('/blog/new')
		
	    }else if(!confirmed){
		console.log("c")
		res.redirect('/blog/list')
	    }else if(art.published){
		console.log("p")
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
		    dir = sails.config.appPath +'/assets/images/blog/'+art.name+'/b',
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
			res.redirect('/blog/show/'+art.name)
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
		    dir = sails.config.appPath +'/assets/images/blog/'+art.name+'/s',
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
			res.redirect('/blog/')
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
		res.redirect('/blog/newImage')
	    }else{
		var upFile = req.file('image'),
		    dir = sails.config.appPath +'/assets/images/blog/'+art.name,
		    formats = ['svg','png','jpg'],
		    desName = params.name,
		    formLink = '/blog/newImage/'+art.name,
		    options = [
			{
			    name: params.name+'-little',
			    ext:'png',
			    width: 600,
			    ifOrignFormat:['png','svg']
			},
			{
			    name: params.name+'-medium',
			    ext:'png',
			    width: 1200,
			    ifOrignFormat:['png','svg']
			},
			{
			    name: params.name+'-little',
			    ext: 'jpg',
			    width: 600,
			    ifOrignFormat:['jpg']
			},
			{
			    name: params.name+'-medium',
			    ext: 'jpg',
			    width: 1200,
			    ifOrignFormat:['jpg']
			},
			{
			    name: params.name+'-light',
			    ext: 'jpg',
			    ifOrignFormat:['jpg']
			},
			{
			    name: params.name,
			    ext:'png',
			    ifOrignFormat: ['svg']
			    
			}
		    ]
		
		UploadImg(req,res,upFile,dir,formats,desName,formLink,options,function(err,ext){
		    if(err) return next(err)
		    art.images[params.name]={
			ext: ext,
			alt: params.alt
			
		    }
		    
		    art.save(function(err,artUploaded){
			if(err) return next(err)
			res.redirect('/blog/edit/'+art.name)
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
		}
		res.redirect('/blog/new')
	    }else{
		var imgName = req.param('name')
		if(!art.images || !art.images[imgName]){
		    req.session.flash={
			err:[{name:'noImage',message:"Cette image n'existe pas"}]
		    }
		    res.redirect('/blog/edit'+art.name)
		}else{
		    var endToRm =[];
		    switch(art.images[imgName].ext){
		    case 'jpg': endToRm = ['-light.jpg','-medium.jpg','-little.jpg','.jpg']
			break;
		    case 'png': endToRm = ['-medium.png','-little.png','.png']
			break;
		    case 'svg' : endToRm = ['-medium.png','-little.png','.png','.svg']
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
			    })
			}			
		    }

		    rmNext(null,function(){
			delete art.images[imgName]
			art.save(function(err,artUpdated){
			    if(err) return next(err)
			    res.redirect('/blog/edit/'+ art.name)
			})
		    })
		}
	    }
	})
    }
};


function UploadImg(req,res,upFile,dir,formats,desName,formLink,options,next){

    if(arguments.length==8){
	var next = options
	var options = []
    }

    var supportedFormats = ['svg','png','jpg'];
    
    upFile.upload(function (err, uploadedFiles) {
	if (err) return res.negotiate(err);
	
	if(uploadedFiles.length !==1){
	    req.session.flash = {
		err:[{name:"wrongNumberOfFiles",message:"le nombre de fichiers n'est pas correct"}]
	    };
	    res.redirect(formLink)
	}else{
	    
	    var file = uploadedFiles[0],
		im = require('imagemagick');
	    im.identify(file.fd, function(err,features){
		if(err) return next(err)
		
		var ext = features.format.toLowerCase();

		//transform jpeg in jpg

		if(ext == 'jpeg') ext= 'jpg'
		
		var orignPath = dir+'/'+desName+'.'+ext;
		
		console.log(orignPath,file.fd)
		if(supportedFormats.indexOf(ext)<0 || formats.indexOf(ext)<0){
		    req.session.flash = {
			err:[{name:"wrongFile",message:"le format du fichier n'est pas correct"}]
		    };
		    res.redirect(formLink)
		}else{
		    require('fs').rename(file.fd,orignPath,function(err){
			if(err) return next(err)
			console.log(err)
			var cptCall = 0;

			if(options.length == 0)
			    return next(null,err);
			
			options.forEach(function(option){
			    if(!option.ifOrignFormat || option.ifOrignFormat.indexOf(ext) > -1){
				var opts = {
				    srcPath: orignPath,
				    dstPath: dir +'/'+option.name+'.'+option.ext,
				    width: (option.width)?option.width: features.width,
				    format: option.ext
				}

				if(ext == 'svg'){ //svgtopng only
				    if(option.ext == 'png'){ 
					im.resize(opts,function(err,stdout,stderr){
					    if(err) return next(err)
					    cptCall ++
					    if(cptCall == options.length)
						return next(null,ext)
					})
				    }else
					return next([{name:"unvalidParameter",message:"Impossible de transformer le svg en quelque chose d'autre que png"}])
				}else if(supportedFormats.indexOf(option.ext)>-1){
				    im.resize(opts,function(err,stdout,stderr){
					if(err) return next(err)
					cptCall ++
					if(cptCall == options.length)
					    return next(null,ext)
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
	    
	}
    });
}
