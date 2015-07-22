/**
* Img/sticker.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var Mkdirp = require('mkdirp');

module.exports = {

    shema: true,
    
  attributes: {
      alt:{
	  type:'string'
      },
      artName:{
	  type:'string',
	  required: true
      }
  },

    beforeCreate: function(values,next){
	Mkdirp(sails.config.appPath+'/assets/blog/'+values.artName+'/s',function(err){
	    if(err) return next(err)
	    next();
	});
    }
};

