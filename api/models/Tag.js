/**
 * Tag.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {
    types:{
        URI: function(value){
            return URI;
        }
    },

    shema: true,

    attributes: {
        name: {
            type: 'string',
            URI: true
        },
        articles:{
            collection: 'Blog',
            via: 'tags'
        }
    },
    favoriteTags:[],
    findFavoriteTags: function(){
        Tag.favoriteTags= [];
        var sortable = [], cpt = 0;

        Tag.find({}).populate('articles').exec(function(err,tags){
            if(err) return;
            if(!tags) return;
            sortable = tags.sort(function(a,b){return b.articles.length-a.articles.length});
            if(sortable.length !== 0){
                var maxArt = sortable[0].articles.length;
                sortable.forEach(function(tag){

                    var artPublishedNum = 0,i;

                    for(i=0;i<tag.articles.length;i++){
                        if(tag.articles[i].published)
                            artPublishedNum++;
                    }


                    if(artPublishedNum>0 && cpt < sails.config.variables.blog.tag.howManyDisplay){
                        tag.toObject();
                        tag.weight = tag.articles.length / maxArt;
                        tag.articles = null;

                        Tag.favoriteTags.push(tag)
                    }
                    cpt++;
                    if(cpt == sortable.length)
                        Tag.favoriteTags.sort(function(a,b){return (a.name<b.name)?-1:1;})
                })
            }

        })
    },

    beforeValidate: function(values,next){
        URI = ConvertString.isValidURI(values.name)
        next()
    }
};
