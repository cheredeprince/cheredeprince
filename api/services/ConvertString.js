var Twitter  = require('twitter-text'),
    Markdown = require('markdown').markdown,
    Lodash = require('lodash'),
    EscapeHTML = require('escape-html'),
    Mathjax = require('mathjax-node/lib/mj-single');
Mathjax.start();
module.exports = {
    displayDate: function(date){
        if(date instanceof Date){
            var month = (date.getMonth()<9)? "0"+(date.getMonth()+1):date.getMonth()+1;

            return date.getDate()+"/"+month+"/"+date.getFullYear();
        }else
            return "-"
    },

    dataDate:function(date){
        if(date instanceof Date){
            var month = (date.getMonth()<9)? "0"+(date.getMonth()+1):date.getMonth()+1,
                cDay = (date.getDate()<9)? "0"+(date.getDate()+1):date.getDate()+1;
            return date.getFullYear()+ '-' +month+ '-' +cDay;

        }else
            return ''
    },

    simply:function(string){
        if(typeof string != 'string') return '';
        else{
            var simpleString = string.trim()
                    .replace(/ /g,'-')
                    .replace(/[èéêë]/g,"e")
                    .replace(/[àâä]/g,"a")
                    .replace(/[ûüù]/g,"u")
                    .replace(/ç/g,"c")
                    .replace(/[ôö]/g,"o")
                    .replace(/[ïî]/g,"i")
                    .replace(/["'\\$:;,\?\.\!\(\)\[\]#$£*/]/g,"")
                    .toLowerCase();
            return simpleString;
        }

    },

    isValidURI:function(string){
        return typeof string == 'string' && string == encodeURI(ConvertString.simply(string))
    },

    // récupérer et supprime les mentions d'un text
    dropParents: function(text,next){
        var content = text.trim();
        var parentsWithIndices = Twitter.extractMentionsWithIndices(content)
        var parents = []
        var move = 0
        parentsWithIndices.forEach(function(parentWithIndices,key){
            content= content.slice(0,parentWithIndices.indices[0] - move) + content.slice(parentWithIndices.indices[1] - move)
            move += parentWithIndices.screenName.length +1
            parents.push(parentWithIndices.screenName)

            if(key+1 == parentsWithIndices.length)
                next(content,parents)
        })
        if(parentsWithIndices.length == 0)
            next(content,[])
    },

    dropTags: function(text,next){
        var content = text.trim()
        var tagsWithIndices = Twitter.extractHashtagsWithIndices(content);
        var tags = [];
        var move = 0;
        tagsWithIndices.forEach(function(tagWithIndices,key){
            content= content.slice(0,tagWithIndices.indices[0] - move) + content.slice(tagWithIndices.indices[1] - move)
            move ++
            tags.push(tagWithIndices.hashtag)

            if(key+1 == tagsWithIndices.length)
                next(content,tags)

        })

        if(tagsWithIndices.length == 0)
            next(content,tags)
    },

    //récupérer les hashtags, supprimer ceux sur la dernière ligne et transforme en mot les autres

    getTags : function(text,next){
        var content = text.trim();
        var mathText = this,
            getTagsInText = function(text,listOfTags,next){
                var content = text.trim()
                var tagsWithIndices = Twitter.extractHashtagsWithIndices(content);
                var tags =(listOfTags)? listOfTags: [];
                var move = 0
                tagsWithIndices.forEach(function(tagWithIndices,key){
                    content= content.slice(0,tagWithIndices.indices[0] - move) + content.slice(tagWithIndices.indices[1] - move -tagWithIndices.hashtag.length)
                    move ++
                    tags.push(tagWithIndices.hashtag)

                    if(key+1 == tagsWithIndices.length)
                        next(content,tags)

                })

                if(tagsWithIndices.length == 0)
                    next(content,tags)
            },
            dropTagsAtEnd = function(text,next){
                var content = text.trim()
                var lastLigne = content.split('\n').pop(),
                    wordsOfLastLigne = lastLigne.split(' ');
                var isTagLigne = true;
                wordsOfLastLigne.forEach(function(word,key){
                    if(word[0] != "#")
                        isTagLigne = false
                    if(key +1 == wordsOfLastLigne.length && isTagLigne){
                        next(content.slice(0,content.lastIndexOf('\n')),Twitter.extractHashtags(lastLigne))
                    }else if(key +1 == wordsOfLastLigne.length)
                        next(content,[])

                })

                if(wordsOfLastLigne.length ==0)
                    next(content,[])
            }


            dropTagsAtEnd(content,function(content,tagsAtEnd){
            getTagsInText(content,tagsAtEnd,function(content,tags){
                next(content,tags)
            })
        })
   },

    /* BetterTypo modifie les espaces d'un texte html
     * args : un texte en html
     * returns : html
     */

    betterTypo : function(html){

        return html.replace(/\s([!:\?…;»])/g, function (el1, el2) {
            return '&nbsp;' + el2;
        }).replace(/(«)\s/g, function (el1, el2) {
            return el2 + '&nbsp;';
        });

    },

    /* ParseMathText récupére les informations issues d'un texte de Math
     * args : un texte de Math
     * returns : obj.parents = liste des @mentions dans le texte
     *           obj.tags    = liste des #tags dans le texte
     *           obj.ems     = liste des éléments encadrés par * ou _ in txt
     *           obj.strongs =                                 **   __
     *           obj.html    = html obtenu en compilant le markdown du texte sans mention et tag de dernière lignes
     */
    parseMathText: function(text,next){

        var dropEmAndStrong,obj ;

        dropEmAndStrong = function(text,next){
            var content = text.trim(),
                tree = Markdown.toHTMLTree(content),
                ems = [],
                strongs = [];

            var findEmAndStrong = function(tree,emList,strongList,next){
                if(tree[0] =='em' && tree.length ==2){
                    emList.push(tree[1])
                    next(emList,strongList)
                }else if(tree[0] =='strong' && tree.length ==2){
                    strongList.push(tree[1])
                    next(emList,strongList)
                }else{
                    var cpt = 0;
                    tree.forEach(function(elt,key){
                        if(elt instanceof Array){
                            findEmAndStrong(elt,emList,strongList,function(emList,strongList){
                                cpt ++;
                                if(cpt == tree.length)
                                    next(emList,strongList)
                            })
                        }else{
                            cpt ++;
                            if(cpt == tree.length)
                                next(emList,strongList)
                        }
                    })
                }
            }

            findEmAndStrong(tree,ems,strongs,function(ems,strongs){
                next(ems,strongs,Markdown.renderJsonML(tree))
            })

        }

        ConvertString.dropParents(text,function(content,parents){
            ConvertString.getTags(content,function(content,tags){

                content = content.replace(RegExp("©|¶","g"),'');
                var bigLatexs = [], latexs = [];
                content = ConvertString.deleteBetween(content,'$$','©',bigLatexs);
                content = ConvertString.deleteBetween(content,'$','¶',latexs);


                dropEmAndStrong(content,function(ems,strongs,html){


                    html = ConvertString.betterTypo(html);
                    html = ConvertString.insertDeleted(html,'$$','©',bigLatexs);
                    html = ConvertString.insertDeleted(html,'$','¶',latexs);
                    obj= {
                        parents : parents,
                        tags    : tags,
                        ems     : ems,
                        strongs : strongs,
                        html    : html
                         }
                    next(obj);
                })
            })
        })

    },

    /*
     * Prend un code html contenant du latex et rend le html contenant du mathml
     */

    latexToMathML: function(html,next){
        var aux = function(html,symbol,char,is_inline,end){
            var latexs = [],
                bout = ConvertString.deleteBetween(html,symbol,char,latexs),
                format = (is_inline)?'inline-TeX':'inline-TeX',
                cpt,i=0;

            if(latexs.length == 0)
                end(html);

            for(cpt=0;cpt<latexs.length;cpt++){
                Mathjax.typeset({math: latexs[cpt],
                                 format: format,
                                 mml:true},function(data){
                                     latexs[i] = data.mml;
                                     i++;
                                     //console.log(i,latexs);
                                     if(i==latexs.length)
                                         end(ConvertString.insertDeleted(bout,'',char,latexs,true));
                                 });
            }
        };
        aux(html,'$$','©',true,function(pre_html){

            aux(pre_html,'$','¶',false,next);
        });
    },



    /*
     * Supprime les élements entre un signe et les remplacent par un caractère suivit de l'index du string supprimé dans deleteds
     */
    deleteBetween: function(sentence,symbol,char,deleted){
        var cpt, results = [] ;
        var array = (typeof sentence == 'string')?sentence.split(symbol):[];

        if(array.length %2 ==1)
            for(cpt = 0;cpt<array.length; cpt++)
                if(cpt %2 ==0){
                    results.push(array[cpt])
                }else if(char){
                    results.push(char)
                    deleted.push(array[cpt])
                }

        return (results.length !== 0)?results.join(' '): sentence;
    },


    /*
     * Reinsert les éléments supprimés
     */
    insertDeleted: function(sentence,symbol,char,deleted,noEscape){
        var cpt, results = [], insertion ;
        var array = (typeof sentence == 'string')?sentence.split(char):[];

        var nb_char = sentence.replace(new RegExp("[^"+char+"]",'g'),"").length;
        if(deleted.length == nb_char)
        for(cpt = 0;cpt<array.length; cpt++){
            if(cpt !== 0){
                if(noEscape)
                    insertion = deleted.shift();
                else
                    insertion = EscapeHTML(deleted.shift());

                results.push(symbol+insertion+symbol);
            }
            results.push(array[cpt]);
        }

        return (results.length !== 0)?results.join(' '): sentence;
    },
    /*
     * extrait les expressions d'une phrase
     */

    extractExpr : function(sentence){
        // on veut supprimer tous les mots de deux lettres ou moins et quelques autre
        var wordToEscape = RegExp("\\s(d'|l'|n')|"+
                                  "\\s(la|une|dans|des|par|qui|que|mais|dont|car|le|les|un|où|et|de|au|pour|entre|est dit|a|il|pas|on)\\s|"+
                                  "[+*\$^()=]","gi");
        //on retire les espaces réservé au latex

        var sentenceWithoutLatex = ConvertString.deleteBetween(ConvertString.deleteBetween(sentence,'$$'),'$');
        //on ajoute des espaces au début et à la fin du mot pour les mots à supprimer des bords
        sentenceWithoutLatex = ' '+ sentenceWithoutLatex+' ';
        //la seule chose qui sépare les mots sont les espaces les sauts de ligne , : ...
        return Lodash.words(sentenceWithoutLatex.replace(wordToEscape," "),/[^ \s\n,:;.!?]+/g);
    },
    /*
     *ajoute les combinaisons des mots successifs au une liste de expr
     */
    addTwoWordsExpr: function(listOfExpr){
        var a = [], key;
        if(listOfExpr.length == 0)
            return a;
        for(key=0 ; key<listOfExpr.length;key++){
            a.push(listOfExpr[key]);
            if(key <listOfExpr.length -1)
                a.push(listOfExpr[key] +' '+listOfExpr[key+1])
            else{
                return a;
            }
        }
    },
    /*
     * Cherche les différents manières de lire une liste d'exprs dans l'ordre et les transforment en mots clés avec pluriels et suivant qu'ils sont finis ou pas
     */
    choosesReadingExprs: function(exprs,is_finished){

        var makeReg = function(string){
            var choose = (is_finished)?'':'[a-zA-Z]*';

            return new RegExp("^"+string+ choose+"(|s|x)$","g")
        }


        var readings = [],reading_copy,expr,exprs_copy;
        var chooseRec = function(reading,exprs,is_before_composed){
            if(exprs.length == 0)
                return readings.push(Lodash.map(reading,makeReg));
            if(is_before_composed){
                reading.push( Lodash.snakeCase(exprs.shift()) )
                chooseRec(reading,exprs,false);
            }
            else{
                reading_copy= _.clone(reading);
                exprs_copy  = _.clone(exprs);

                reading_copy.push( Lodash.snakeCase( exprs_copy.shift() ));
                reading.push( Lodash.snakeCase( reading.pop()+ ' ' + exprs.shift() ) );

                chooseRec(reading_copy,exprs_copy,false);
                chooseRec(reading,exprs, true);
            }
        }

        chooseRec([],_.clone(exprs),true);
        return readings;
    },
    /*
     * renseigne la présence de mots-clés dans un texte par son expression ou false
     */
    searchKeywords: function(text,keywordsName){
        var presencePerKeyword = {}, CS = this,key;
        var textExprs = CS.addTwoWordsExpr(CS.extractExpr(text)),
            textKeywordsName = Lodash.map(textExprs,function(expr){
                return Lodash.snakeCase(expr);
            });

        if(keywordsName.length == 0)
            return presencePerKeyword;

        for(key=0;key < keywordsName.length;key ++ ){
            presencePerKeyword[keywordsName[key]] =
                (textKeywordsName.indexOf(keywordsName[key]) !== -1)?textExprs[textKeywordsName.indexOf(keywordsName[key])]: false;
            if(keywordsName.length == key +1)
                return presencePerKeyword;
        }
    }
}
