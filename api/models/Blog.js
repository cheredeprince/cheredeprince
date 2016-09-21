/**
 * Blog.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

var    Mkdirp = require('mkdirp');

module.exports = {

    shema: true,

    /**
     * Custom validation types
     */
    types: {
        uniqueName: function(value) {
            return uniqueName;
        },
        URI: function(value){
            return URI;
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
            URI: true,
            uniqueName: true
        },
        published: {
            type: 'boolean',
            defaultsTo: false
        },
        publishedAt:{
            type:'date'
        },
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
        introBB: {
            type: 'text',
        },
        textBB:{
            type: 'text'
        },
        presentation:{
            type: 'text'
        },
        category:{
            type:'string',
            'enum':  Object.keys(sails.config.variables.blog.categories)
        },
        images:{
            type:'json'
        },
        tags:{
            collection: 'Tag',
            via: 'articles'
        },comments:{
            collection: 'Comment',
            via: 'article'
        },

        toOBJ: function() {
            var art = this;
            var obj = this.toObject();

            obj.publishedAtDisplay = ConvertString.displayDate(art.publishedAt)
            obj.publishedAtData = ConvertString.dataDate(art.publishedAt)
            obj.createdAtDisplay = ConvertString.displayDate(art.createdAt)
            obj.createdAtData = ConvertString.dataDate(art.createdAt)
            obj.categoryDisplay = sails.config.variables.blog.categories[obj.category]
            return obj;
        },
        setTags: function(listOfIds,next){
            var art = this;
            var cpt = 0;

            //supprime les tags inexistants
            art.tags.forEach(function(tag){
                if(listOfIds.indexOf(tag.id) ==-1)
                    art.tags.remove(tag.id)
            })

            if(listOfIds.length == 0)
                next(null)
            listOfIds.forEach(function(id){
                art.tags.add(id)
                cpt++;

                if(cpt == listOfIds.length){
                    next(null)
                }
            })

        },
        findRelatedArts: function(next){
            var art = this;
            var scoreByArt = {};

            function giveScore(artsList,score,next){
                var cpt=0;
                if(artsList.length == 0)
                    next()
                artsList.forEach(function(art){
                    if(scoreByArt[art.id]){
                        scoreByArt[art.id] = scoreByArt[art.id] + score;
                    }else
                        scoreByArt[art.id] = score;
                    cpt++;
                    if(artsList.length == cpt)
                        next()
                })
            }

            function listArtsWithSameTag(cpt,list,next){
                if(cpt == art.tags.length)
                    next(null,list)
                else
                    Tag.findOne(art.tags[cpt].id).populate('articles').exec(function(err,tag){
                        if(err) return next(err);
                        var cpt2 =0;
                        tag.articles.forEach(function(art){
                            if(art.published)
                                list.push(art)
                            cpt2++;
                            if(cpt2 == tag.articles.length)
                                listArtsWithSameTag(cpt+1,list,next)
                        })


                    })
            }

            Blog.find({category: art.category,published: true},function(err,arts){
                giveScore(arts,0.5,function(){
                    listArtsWithSameTag(0,[],function(err,list){
                        if(err) return next(err);
                        var scorePerTag = (art.tags.length == 0)? 0: 0.5/art.tags.length;
                        giveScore(list,scorePerTag,function(){
                            delete scoreByArt[art.id]
                            var bestResults = Object.keys(scoreByArt).slice(0,3);
                            Blog.find(bestResults,function(err,arts){
                                next(arts)
                            })
                        })
                    })
                })
            })
        }
    },

    beforeValidate: function(values, next){
        URI = ConvertString.isValidURI(values.name);
        Blog.find({name: values.name}, function(err,records){
            uniqueName = !err && (records.length == 0 || records[0].id == values.id);
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

            if(oldValues.name !==values.name){
                require('fs').renameSync(sails.config.appPath+'/assets/images/blog/'+oldValues.name,sails.config.appPath+'/assets/images/blog/'+values.name)
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
                    next()
                });
            });
        })
    },

    afterUpdate: function(values,next){
        Tag.findFavoriteTags();
        next();
    }


};
