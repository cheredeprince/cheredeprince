/**
* MathGraph.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var versionLifeDuration = 60*60;

module.exports = {

    shema: true,
    attributes: {
        nodes:{
            type: 'array',
            defaultsTo: []
        },
        edges:{
            type:'array',
            defaultsTo: []
        }
    },
    updateElement: function(oldId,id,label,type,parentsId,next){
        console.time('graphUp');
        MathGraph.findOrCreate({sort:{createdAt:1}},{})
            .exec(function(err,g){
                if(err) return next(err);
                //on récupére le graphe
                var parent,cpt,old_node,outNeighborsIndex;

                var G = GraphPlus(g.id,g.nodes,g.edges),
                    graph = G.graph;
                //maintenant qu'on a le dernier graphe, on le met à jour
                old_node = graph.getNode(oldId);
                if(old_node){

                    //si le sommet existe
                    // on récupère ses fils
                    outNeighborsIndex = graph.outNeighborsList(oldId);
                    //, on le supprime
                    graph.dropNode(oldId);

                    graph.addNode({
                        id    : id,
                        label : label,
                        type  : type,
                        x     : old_node.x,
                        y     : old_node.y
                    });
                    // on ajoute les nouveaux parents
                    for(cpt=0; cpt<parentsId.length;cpt++){
                        parent = parentsId[cpt];
                        console.log(parent);
                        graph.addEdge({
                            id     : parent+'>'+id,
                            source : parent,
                            target : id
                        });
                    }
                    // on ajoute les fils
                    for(cpt=0; cpt<outNeighborsIndex.length;cpt++){
                        parent = outNeighborsIndex[cpt];
                        console.log(parent);
                        graph.addEdge({
                            id     : id+'>'+parent,
                            source : id,
                            target : parent
                        });
                    }
                    //et on sauvegarde
                    MathGraph.update(g.id,{nodes:graph.nodes(),edges: simpleEdges(graph.edges())},function(err,updated){
                        if(err) return next(err);
                        G.sendChanges();
                        console.timeEnd('graphUp');
                        next();
                    });
                }else
                    next();
        });
    },

    newElement: function(id,label,type,parentsId,next){
        MathGraph.findOrCreate({sort:{createdAt:1}},{})
            .exec(function(err,g){
                if(err) return next(err);
                //on récupére le graphe

                var G = GraphPlus(g.id,g.nodes,g.edges),
                    graph = G.graph;
                var x_position=0, y_position = 0;
                //on construit la position du nouveau sommet comme barycentre de ses parents
                parentsId.forEach(function(parent_id,key){
                    var parent = graph.getNode(parent_id);
                    if(parent){
                        x_position += parent.x;
                        y_position += parent.y;

                        if(key +1 == parentsId.length){
                            // on construit le sommet
                            x_position = x_position/parentsId.length;
                            y_position = y_position/parentsId.length;

                            graph.addNode({
                                id    : id,
                                label : label,
                                type  : type,
                                x     : x_position,
                                y     : y_position
                            });

                            //on ajoute les liens parents enfants
                            var i = 0;
                            for(i=0;i<parentsId.length;i++){
                                var parentId = parentsId[i];
                                graph.addEdge({
                                    id     : parentId+'>'+id,
                                    source : parentId,
                                    target : id
                                });
                            }
                            //on sauvegarde
                            MathGraph.update(g.id,{nodes:graph.nodes(),edges:simpleEdges(graph.edges())},function(err,updated){
                                if(err) next(err);
                                G.sendChanges();
                                next();
                            });
                        }
                    }else{
                        next(new Error("Parent "+parent_id +" inexistant dans le graphe"))
                    };
                });
                if(parentsId.length == 0){
                    graph.addNode({
                        id    : id,
                        label : label,
                        type  : type,
                        x     : x_position,
                        y     : y_position
                    });
                    MathGraph.update(g.id,{nodes:graph.nodes(),edges:simpleEdges(graph.edges())},function(err,updated){
                        if(err) next(err);
                        G.sendChanges();
                        next();
                    });
                }

            });
    },

    savePosition: function(position_map,next){
        MathGraph.find().limit(1).exec(function(err,graphs){
            if(err) return next(err);
            if(!graphs[0]) next(null);
            var graph = graphs[0],
                nodes = graph.nodes,
                cpt,node;

            for(cpt =0;cpt<nodes.length;cpt++){
                node = nodes[cpt];
                if(position_map[node.id]){
                    node.x = position_map[node.id].x;
                    node.y = position_map[node.id].y;
                }
            }

            graph.save(function(err){
                if(err) return next(err);

                next(null);
            });
        });
    }
};

/* personalisation du graphe */

var Graph = require('sigma').classes.graph,
    GraphChanges=[];

Graph.addMethod('getNode',function(index){
    if(typeof index == 'string'){
        return this.nodesIndex[index];
    }else if(Array.isArray(index)){
        var cpt,
            nodes = [],
            nodesIndex = this.nodesIndex;

        for(cpt =0;cpt<index.length;cpt++){
            nodes.push( nodesIndex[ index[cpt] ] );
        }

        return nodes;
    }
});

Graph.addMethod('updateNode',function(old_id,id,label,type){
    var graph = this,
        neighborsIndex = Object.keys(graph.allNeighborsIndex[old_id]),
        cpt,node;
    for(cpt=0;cpt<neighborsIndex.length;cpt++){
        this.nodesIndex[neighborsIndex[cpt]];
    }
    return neighborsNodes;
});

Graph.addMethod('load',function(nodes,edges){
    var edge,cpt;
    for(cpt = 0;cpt<edges.length;cpt++){
        edge = edges[cpt];
        edge.id = edge.source+'>'+edge.target;
    }
    this.read({nodes: nodes, edges: edges});
});

Graph.addMethod('outNeighborsList',function(index){
    var outNeighborsIndex = this.outNeighborsIndex;
    return Object.keys(outNeighborsIndex[index]);
})

Graph.attach('addNode','publishAddNode',function(args){
    GraphChanges.push({
        action : 'addNode',
        arg    : args
    });
});

Graph.attach('dropNode','publishDropNode',function(args){
    GraphChanges.push({
        action: 'dropNode',
        arg   : args
    });
});


Graph.attach('addEdge','publishAddEdge',function(args){
    GraphChanges.push({
        action: 'addEdge',
        arg   : args
    });
});

Graph.attach('dropEdge','publishDropEdge',function(args){
    GraphChanges.push({
        action: 'dropEdge',
        arg   : args
    });
});

var GraphPlus = function(id,nodes,edges){
    var g = require('sigma').classes.graph,
        graph;

    var sendChanges = function(){
        if(GraphChanges.length>0)
            MathGraph.publishUpdate(id,GraphChanges);
    };

    graph = new g;
    graph.load(nodes,edges);
    // on initialise le tas des changements après le chargement du graphe
    GraphChanges = [];
    return {graph       : graph,
            sendChanges : sendChanges};
};

var simpleEdges = function(edges){
    var cpt,edge,simpleEdges = [];
    for(cpt =0;cpt<edges.length;cpt++){
        edge = edges[cpt];
        simpleEdges[cpt] = {
            source: edge.source,
            target: edge.target
        };
    }
    return simpleEdges;
};
