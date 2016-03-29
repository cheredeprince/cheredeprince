/**
* Leadin.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var BBCodeParser = require('bbcode-parser'),
    BBCodeParseTree = require('bbcode-parser');

module.exports = {

    shema:true,
    
  attributes: {

      contentBB:{
	  type: 'text',
	  required: true
      },
      contentHTML:{
	  type:'text'
      },
      pages:{
	  type: 'array',
	  required: true
      },
      place:{
	  type: 'float',
	  defaultsTo: 0.5
      },
      
	toOBJ: function() {
	    var leadin = this;
	    var obj = this.toObject();
	    
	    obj.createdAtDisplay = ConvertString.displayDate(leadin.createdAt)
	    return obj;
	}
  },

    beforeUpdate: function(values,next){
	beforeAllChange(values,next)
    },

    beforeCreate: function(values,next){
	values.place = Math.random();
	beforeAllChange(values,next)
    },

    findByPage:function(page,next){
	var rank = Math.random()
	
	Leadin.findOne({where:{pages : { contains: page},
			       place:{ '>': rank}},
			sort: 'place'},
		       function(err,leadin){

			   if(err) return next(err)
			   
			   if(!leadin){
			       Leadin.findOne({where:{pages : { contains: page},
						      place:{ '<': rank}},
					       sort: {place:0}},function(err,leadin){
						   if(err) return next(err)
						   if(!leadin) return next(null,null)
						   else
						       next(null,leadin)
					       })
			   }else
			       next(null,leadin)
			   
			})
    }

};

var beforeAllChange = function(values,cb){
    values.pages.push('all')
    
    	BBTags.intro(function(introBBTag){
	    var Parser = new BBCodeParser(introBBTag);

	    if(values.contentBB)
	    	values.contentHTML = Parser.parseString(values.contentBB);

	    cb();
	})
}
