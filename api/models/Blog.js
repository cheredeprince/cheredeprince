/**
 * Blog.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

var BBCodeParser = require('bbcode-parser'),
    BBCodeParseTree = require('bbcode-parser'),
    Mkdirp = require('mkdirp')

module.exports = {

    shema: true,

    /**
     * Custom validation types
     */
    types: {
	uniqueName: function(value) {
	    return uniqueName;	    
	}
    },
    
    attributes: {
	title:{
	    type: 'string',
	    required: true
	},
	name:{
	    type:'string',
	    required: true,
	    unique: true,
	    uniqueName: true
	},
	published: {
	    type: 'boolean',
	    defaultsTo: false
	},
	publishedAt: 'date',
	banner: {
	    type: 'boolean',
	    defaultsTo: false
	},
	altBanner:{
	    type:'string'
	},
	author: {
	    model: 'User'
	},
	sticker: {
	    type: 'boolean',
	    defaultsTo: false
	},
	altSticker:{
	    type: 'string'
	},
	introHTML: {
	    type: 'text'
	},
	textHTML:{
	    type: 'text'
	},
	presentationHTML:{
	    type: 'text'
	},
	introBB: {
	    type: 'text',
	},
	textBB:{
	    type: 'text'
	},
	presentationBB:{
	    type: 'text'
	},
	category:{
	    type:'string',
	    enum: ['trip','event','life']
	},
	images:{
	    type:'json'
	}
    },

    beforeValidate: function(values, next){
	Publication.findOne({name: values.name}, function(err,record){
	    uniqueName = !err && !record;
	    next();
	})
    },
    
    beforeCreate: function(values,next){
	//creation sticker's folder
	Mkdirp(sails.config.appPath+'/assets/images/blog/'+values.name+'/s',function(err){
	    if(err) return next(err)
	    // creation of banner's folder
	    Mkdirp(sails.config.appPath+'/assets/images/blog/'+values.name+'/b',function(err){
		if(err) return next(err)
	   	next();
	    });
	});
    },
    
    beforeUpdate: function(values,next){

	Blog.findOne(values.id,function(err,oldValues){

	    if(err) return next(err);
	    
	    if(!oldValues.published && values.published){
	    	values.publishedAt = new Date();
	    }
	    
	    var images = oldValues.images,
	    	name = (values.name)? values.name : oldValues.name;   

	    // formatage du bbCode
	    BBTags.text(name,images,function(textBBTag){
		
	    	if(values.textBB){
	    	    var textParser = new BBCodeParser(textBBTag);//BBCodeParser.defaultTags()
	    	    values.textHTML = textParser.parseString(values.textBB);}
		
	    	BBTags.intro(function(introBBTag){
	    	    var introParser = new BBCodeParser(introBBTag);
	    	    if(values.introBB)
	    		values.introHTML = introParser.parseString(values.introBB);
	    	    if(values.presentationBB)
	    		values.presentationHTML = introParser.parseString(values.presentationBB);
	    	    next()
	    	});
	    });    
	})
    },

    
};


