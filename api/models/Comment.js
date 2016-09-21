/**
 * Comment.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

var Gravatar = require('gravatar');

module.exports = {

    shema: true,

    types: {
	infTo3: function(value) {
	    return infTo3;	    
	}
    },
    
    attributes: {
	contentBB:{
	    type:'text',
	    required: true
	},
	contentHTML:{
	    type: 'text'
	},
	pseudo:{
	    type: 'string',
	    required: true
	},
	email:{
	    type:'email',
	    required: true
	},
	site:{
	    type: 'url'
	},
	article:{
	    model: 'Blog',
	    required: true
	},
	status:{
	    type: 'text',
	    enum: ['valid','refused','waiting'],
	    defaultsTo: 'waiting'
	},
	responseTo:{
	    model: 'Comment'
	},
	level:{
	    type: 'integer',
	    infTo3: true,
	    defaultsTo: 0
	},
	responses: {
	    collection:'Comment',
	    via: 'responseTo'
	},
	toOBJ: function() {
	    var comment= this;
	    var obj = this.toObject();
	    
	    obj.createdAtDisplay = ConvertString.displayDate(comment.createdAt)
	    obj.createdAtData = ConvertString.dataDate(comment.createdAt)
	    
	    obj.avatar = Gravatar.url(comment.email, {s: '56', r: 'x', d: 'http://cheredeprince.net/images/avatars/default.png'},false);
	    return obj;
	}
    },

    beforeValidate:function(values,next){
	
	if(values.responseTo){

	    Comment.findOne(values.responseTo,function(err,comment){
		if(err) return next(err)
		if(!comment) return next()
		else{
		    infTo3 = comment.level <3
		    next();
		}	
	    })
	}else{
	    infTo3 = true;
	    next()
	}

	
    },
    
    beforeCreate: function(values, next){

    	BBTags.intro(function(introBBTag){
	    var Parser = new BBCodeParser(introBBTag);

	    if(values.contentBB)
	    	values.contentHTML = Parser.parseString(values.contentBB);
	    
	    if(values.responseTo){
		Comment.findOne(values.responseTo,function(err,comment){
		    if(err) return next(err)
		    if(!comment) return next()
		    else{
			values.level = comment.level +1;
			next();
		    }		    
		})
	    }else{
		values.level = 0;
		next();
	    }
	})
    },
    
    findForArticle: function(article,next){
	var ComPop = {};
	var result = [];
	Comment.find({where:{article: article},sort:{level:0}},function(err,comments){
	    if(err) return next(err);
	    var cpt = 0;
	    if(comments.length == 0)
		next(null,result)
	    comments.forEach(function(com){
		cpt++;
		var comObj = com.toOBJ()
		if(ComPop[comObj.id]){
		    comObj.responses = ComPop[comObj.id]

		}else
		    comObj.responses = []
		if(!ComPop[comObj.responseTo] && comObj.level != 0){
		    ComPop[comObj.responseTo] = [comObj]
		}else
		    if(comObj.level == 0)
			result.push(comObj)
		else
		    ComPop[comObj.responseTo].push(comObj)

		if(cpt == comments.length)
		    next(null,result)
	    })
	})
    },

    findByArticle: function(next){
	Blog.find({sort:{createdAt:0}},function(err,arts){
	    if(err) return next(err);
	    var cpt = 0;
	    arts.forEach(function(art){

		art.toOBJ();
		Comment.findForArticle(art.id,function(err,comments){
		    if(err) next(err)
		    art.comments = comments;
		    cpt ++;
		    if(cpt == arts.length)
			next(null,arts)
		})
	    })
	})
    }
};

