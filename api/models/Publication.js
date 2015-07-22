/**
* Publication.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

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
	    unique: true,
	    uniqueName: true
	},
	published: {
	    type: 'boolean',
	    defaultsTo: false
	},
	publishAt: 'date',
	banner: 'string',
	author: {
	    model: 'User'
	}
    },

    beforeValidate: function(values, next){
	Publication.findOne({name: values.name}, function(err,record){
	    uniqueName = !err && !record
	    next();
	})
    }
};

