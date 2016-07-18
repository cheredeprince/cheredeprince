/**
 * MathComment.js
 *
 * @description ::  Gère un commentaire concernant les éléments mathématiques inclut dans un flux de commentaires
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

        flux:{
            model: 'MathFlux',
            required: true
        }
    },
    
    beforeValidate: function(values, next){
        if(values.flux && isNaN(values.number)){
            MathComment.count({flux: values.flux},function(err,count){
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
            
            values.refs = obj.parents;
                
            next();
        });
    },
    
    beforeCreate: function(values,next){
        values.name = Lodash.snakeCase(values.title);
        
        ConvertString.parseMathText(values.content,function(obj){

            values.contentHTML = obj.html;
            values.strongs = obj.strongs;
            values.ems = obj.ems;
            values.tags = obj.tags;
            
            values.refs = obj.parents;

            next();
            
        });
    }
};

