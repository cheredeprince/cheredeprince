/**
 * MathController
 *
 * @description :: Server-side logic for managing tags
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
module.exports = {
  index: function (req, res, next) {
    // si un nom est demandé
    var name = req.param('id')
    if (name) {
      // on coupe le nom à 20 caractères
      name = require('lodash').snakeCase(name.slice(0, 20))
      if (res.redirect) {
        res.redirect('elt/' + name)
      } else {
        res.end()
      }
    } else {
      res.view({layout: 'math/layout', elt: ''})
    }
  },

  // permet de charger un elt au chargement de la page
  elt: function (req, res, next) {

    var name = req.param('id')

    MathElt.findOne({or: [{name: name}, {oldNames: {contains: name}}]}).populate('parents')
      .populate('children').exec((err, elt) => {
        if (elt) {
          // si on avait le bon nom
          if (elt.name === name) {
            ConvertString.latexToMathML(elt.contentHTML, html => {
              elt.contentHTML = html
              // responsable de trop d'erreurs

              res.view('math/index.ejs', {layout: 'math/layout', elt: elt.toOBJ()})
            })
          } else {
            res.redirect('elt/' + elt.name)
          }
        } else {
          res.notFound()
        }
      })
  },

  completion: function (req, res, next) {
    var request = decodeURI(req.param('id'));

    MathKeyword.search(request,false,function(err,elts,completions){
      if(err) return next(err)

      elts = elts.slice(0,5)
      completions = completions.slice(0,5)

      var key,miniElts=[];

      for(key =0; key<elts.length;key++){
        miniElts.push(elts[key].toMiniOBJ())
      }

      res.json({sugg:miniElts,comp:completions})
    })
  },

  search : function(req,res,next) {
    var request = decodeURI(req.param('id'))

    MathKeyword.search(request,true,function(err,elts,completions){
      if(err) return next(err)
      var eltsId = _.pluck(elts,'id');

      MathElt.find(eltsId).limit(60).populate('children').populate('parents').exec(function(err,elts){
        if(err) return next(err);
        ModelAssets.arraytoOBJ(elts,function(OBJelts){
          MathElt.subscribe(req,_.pluck(elts,'id'));
          res.json(OBJelts);
        });
      });
    });
  },

  find : function(req,res,next) {
    var name = decodeURI( req.param('id'));

    MathElt.findOne({name:name})
      .populate('parents')
      .populate('children')
      .exec(function(err,elt){
        if(err) return next(err);
        if(!elt) return res.end();
        MathElt.subscribe(req,elt.id);
        res.json(elt.toOBJ());
      });
  },

  load : function(req,res,next) {

    var names = req.param('names')

    MathElt.findByName(names)
      .populate('parents')
      .populate('children')
      .exec(function(err,elts){
        if(err) return next(err)
        ModelAssets.arraytoOBJ(elts,function(){
          //on les trie dans le meme ordre que names
          elts.sort(function(a,b){ return names.indexOf(a.name) - names.indexOf(b.name)});

          MathElt.subscribe(req,_.pluck(elts,'id'));
          res.json(elts);

        });
      });
  },

  graph : function(req,res,next){
    MathGraph.find().limit(1).exec(function(err,graphs){
      if(err) return next(err);
      if(! graphs[0]) return res.json();
      graphs[0].changes = null;
      res.json(graphs[0]);
    })
  },

  saveGraph : function(req,res,next){
    var position_map = req.param('position_map');
    MathGraph.savePosition(position_map,function(err){
      if(err) next();
      MathGraph.find().limit(1).exec(function(err,graphs){
        if(err) return next(err);
        MathGraph.publishUpdate(graphs[0].id,{graph:graphs[0]});
      })
      res.end();
    })
  },

  admin_data : function(req,res,next){
    var id = decodeURI(req.param('id'));
    MathElt.findOne(id,function(err,elt){
      if(err) return res.serverError(err);
      if(!elt) return res.end();
      var data = {
        id      : elt.id,
        name    : elt.name,
        title   : elt.title,
        type    : elt.type,
        content : elt.content
      };

      res.json(data);
    });
  },

  admin_create : function(req,res,next){

    var elt = req.param('elt'),
        elt_map = {
          name    : elt.name,
          title   : elt.title,
          type    : elt.type,
          content : elt.content,
          author  : (req.session.User)? req.session.User.id: ''
        };

    MathElt.createElt(elt_map,function(err){
      if(err) return res.serverError(err);

      console.log('math create '+elt_map.name);
      
      Sitemap.addMath(elt_map);
      elt_map.authorName = req.session.User.name;

      RSS.mathCreation(elt_map);
      res.json("élément créé");
    });
  },

  admin_update : function(req,res,next){
    var elt = req.param('elt'),
        id = req.param('elt_id'),
        elt_map = {
          name    : elt.name,
          title   : elt.title,
          type    : elt.type,
          content : elt.content,
          author  : (req.session.User)? req.session.User.id: ''
        };
    MathElt.find(id, function(err,old_elt){
      if(err) return res.serverError(err);
      if(!elt) return res.serverError();

      MathElt.updateElt(id,elt_map,function(err){
        if(err) return res.serverError(err);

	console.log('math update '+elt_map.name);
	
        Sitemap.updateMath(elt_map,old_elt);

	elt_map.authorName = req.session.User.name;
	RSS.mathUpdate(elt_map);

        res.json("élément mis à jour");
      });
    });
  },

  completion_tag : function(req,res,next) {
    var request = decodeURI(req.param('id'));

    MathTag.completeName(request,function(err,completions){
      if(err) return res.serverError(err);

      res.json(completions);
    });
  },


  completion_mention : function(req,res,next) {
    var request = decodeURI(req.param('id'));

    MathElt.completeName(request,function(err,completions){
      if(err) return res.serverError(err);

      res.json(completions);
    });
  },

  subscribe: function(req,res,next){
    MathGraph.find().limit(1).exec(function(err,graphs){
      if(err) return next(err);
      if(! graphs[0]) return res.json();

      MathGraph.subscribe(req.socket, graphs);
    });

    // MathElt.find().exec(function(err,elts){
    //     if(err) return next(err);

    //     MathElt.subscribe(req.socket,elts);
    // });

    MathElt.watch(req);
  },

  rss: function(req,res,next){
    console.log('math get RSS');
    res.type('application/rss+xml');
    res.end(RSS.getMathRSS({indent: true}));
  }
}
