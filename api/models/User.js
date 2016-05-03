/**
* User.js
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
      name:{
	  type: 'string',
	  required: true,
	  unique: true,
	  uniqueName: true
      },
      email:{
	  type:'email'
      },
	pass:{
	  type:'string'
	},
	online: {
	    type: 'boolean',
	    defaultsTo: false
	},
	admin:{
	    type: 'boolean',
	    defaultsTo: false 
	}
    },
    // toJSON: function(){
    // 	var obj = this.toObject();
    // 	delete obj._csrf;
    // 	delete obj.password
    // 	return obj;
    // }



    
    beforeValidate: function(values, next){

	User.find({name: values.name}, function(err,records){
	    uniqueName = !err && (records.length == 0 || records[0].id == values.id);
	    next();
	})
    },
    
    beforeCreate: function(values, next){
	if(!values.password){
	    next([{name:"PasswordRequired",message:"Le mot de passe est absent"}])
	}else{
	    require("bcrypt").hash(values.password,10, function(err,pass){
		if(err){
		    next(err)
		}else{
		    values.pass = pass
		    next();
		}
	    })
	}
    },

    beforeUpdate: function(values, next){
	if(!values.password){
	    next();
	}else{
	    require("bcrypt").hash(values.password,10, function(err,pass){
		if(err){
		    next(err);
		}else{
		    values.pass = pass;
		    next();
		}
	    });
	}
    }
};

