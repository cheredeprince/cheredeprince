/**
 * MathFlux.js
 *
 * @description :: Gère un flux de commentaires attaché à plusieurs éléments
 * @docs        :: 
 */

var Lodash = require('lodash');

module.exports = {


    shema: true,
    
    attributes: {
        number: {
            type: 'integer',
            unique: true,
            autoIncrement: true
        },

        title:{
            type: 'string',
            required: true
        },

        name: {
            type: 'string'
        },
        
        content:{
            type: 'text',
            required : true
        },

        contentHTML:{
            type: 'text'
        },

        author: {
            model: 'User'
        },

        pseudo:{
            type: 'text'
        },

        email:{
            type: 'email'
        },

        comments:{
            collection: 'MathComment',
            via: 'flux'
        },

        elements:{
            collection: 'MathElt',
            via: 'flux'
        }
    },

    beforeValidate: function(values, next){
        if(isNaN(values.number)){
            MathFlux.count(function(err,count){
                if(err) return next(err);

                values.number = count;
                next();
            });
            
        }else
            next();
    },
    
    beforeUpdate: function(values,next){
        values.name = Lodash.snakeCase(values.title);
        
        ConvertString.parseMathText(values.content,function(obj){

            values.contentHTML = obj.html;
            values.strongs = obj.strongs;
            values.ems = obj.ems;
            values.tags = obj.tags;
            
            var parents = obj.parents;
            MathElt.findByNameIn(parents).exec(function(err,elts){
                if(err) return next(err);

                
                next();
            });
        });

    },
    
    beforeCreate: function(values,next){
        values.name = Lodash.snakeCase(values.title);
        
        ConvertString.parseMathText(values.content,function(obj){

            values.contentHTML = obj.html;
            values.strongs = obj.strongs;
            values.ems = obj.ems;
            values.tags = obj.tags;
            
            var parents = obj.parents;
            MathElt.findByNameIn(parents).exec(function(err,elts){
                if(err) return next(err);

                values.elements = _.map(elts,'id');
                
                console.log(values);
                next();
            });
            
        });
    }
    

};
