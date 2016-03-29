/**
 * ImagesController
 *
 * @description :: Server-side logic for managing tags
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var fs = require('fs'),
    path = require('path');

var extToMime = {
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif'
};


module.exports = {
    
    blog : function(req,res,next){
	var file = req.param('file'),
	    name = req.param('name');	

	if(name && file){
	    var filePath = path.join(sails.config.appPath, 'assets/images/blog' ,name,file),
		ext = path.extname(filePath);

	    if(ext && extToMime[ext]){
		res.type(extToMime[ext]);
	    }

	    fs.exists(filePath, function(exists){
		if(!exists) return res.notFound();
		else
		    fs.createReadStream(filePath).pipe(res);
	    });
	}else
	    res.notFound();
    },
    banner : function(req,res,next){
	var file = req.param('file'),
	    name = req.param('name');

	if(file){
	    var filePath = path.join(sails.config.appPath, 'assets/images/blog',name,'b' ,file),
		ext = path.extname(filePath);
	    if(ext && extToMime[ext]){
		res.type(extToMime[ext]);
	    }
	    fs.exists(filePath, function(exists){
		if(!exists) return res.notFound();
		else
		    fs.createReadStream(filePath).pipe(res);
	    });
	}else
	    res.notFound();
    },
    sticker : function(req,res,next){
	var file = req.param('file'),
	    name = req.param('name');

	if(file){
	    var filePath = path.join(sails.config.appPath, 'assets/images/blog',name,'s' ,file),
		ext = path.extname(filePath);
	    if(ext && extToMime[ext]){
		res.type(extToMime[ext]);
	    }

	    fs.exists(filePath, function(exists){
		if(!exists) return res.notFound();
		else
		    fs.createReadStream(filePath).pipe(res);
	    });
	}else
	    res.notFound();
    }
};

