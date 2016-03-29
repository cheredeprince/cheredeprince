/*
 * math.model.js
 * modules des models
 */

math.model.Graph= ( function () {


    //======================== graph Model ======================================
    // ----------------------- BEGIN SCOPE VARIABLES --------------------------

    
    var
    configMap = {

	settable_map : {
	    sigma       : true 
	},
	sigma       : null  
	
    },
    stateMap = {
	borderedIds:[]
    },
    
    configModule,nodes, edges,load,force,save;

    // ---------------------- END SCOPE VARIABLES ------------------------------
    // ---------------------- BEGIN SIGMA METHODS ------------------------------

    sigma.classes.graph.addMethod('load',function(){
	var nodes      = this.nodesArray,
	    edges      = this.edgesArray,
	    edgesIndex = this.nodesIndex,
	    nodesIndex = this.nodesIndex,
	    outNeighborsCount =  this.outNeighborsCount,
	    cpt,node,edge;

	for(cpt = 0; cpt<nodes.length; cpt++){
	    node = nodes[cpt];
	    node.color = math.typeColor(node.type);
	    node.size  = outNeighborsCount[node.id]+1;
	    //node.x = Math.random();
	    //node.y = Math.random();
	}

	for(cpt=0;cpt<edges.length;cpt++){
	    edge = edges[cpt];
	    edge.type  = 'arrow';
	    edge.size  = (outNeighborsCount[edge.target] + outNeighborsCount[edge.source]) / 2;
	    edge.color = nodesIndex[edge.source].color; 
	}
    });

    sigma.classes.graph.addMethod('getNode',function(index){
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
    
    sigma.classes.graph.addMethod('getNeighbors',function(index){
	var graph = this,
	    neighborsIndex = Object.keys(graph.allNeighborsIndex[index]),
	    neighborsNodes = [],
	    cpt,node;
	for(cpt=0;cpt<neighborsIndex.length;cpt++){
	    node = this.nodesIndex[neighborsIndex[cpt]];
	    neighborsNodes.push(node);
	}
	return neighborsNodes;
    })

    sigma.classes.graph.addMethod('change',function(changes){
	var graph = this,
	    nodesIndex = this.nodesIndex,
	    outNeighborsCount = this.outNeighborsCount,
	    cpt,change;
	for(cpt = 0; cpt<changes.length;cpt++){
	    change = changes[cpt];
	    switch(change.action){
	    case 'addNode':
		graph.addNode({
		    id     : change.arg.id,
		    label  : change.arg.label,
		    x      : change.arg.x,
		    y      : change.arg.y,
		    color  : math.typeColor(change.arg.type),
		    size   : (outNeighborsCount[change.arg.id])?outNeighborsCount[change.arg.id]+1:1
		});
		break;
	    case 'addEdge' :
		graph.addEdge({
		    id     : change.arg.id,
		    source : change.arg.source,
		    target : change.arg.target,
		    type   : 'arrow',
		    size   : (outNeighborsCount[change.arg.target] + outNeighborsCount[change.arg.source] +1) / 2,
		    color  : nodesIndex[change.arg.source].color
		});
		break;
		default :  graph[change.action](change.arg);
	    }
	}
    });
    
    sigma.classes.graph.addIndex('borderedIds', {
	constructor: function() {
	    this.borderedIds = [];
	}
    });

    sigma.classes.graph.addMethod('setBorder',function(ids){
	
	var nodes      = this.nodesArray,
	    edges      = this.edgesArray,
	    edgesIndex = this.nodesIndex,
	    nodesIndex = this.nodesIndex,
	    outNeighborsCount =  this.outNeighborsCount,
	    borderedIds     = this.borderedIds,
	    cpt,node;
	//on retire la bordure des anciennes
	for(cpt=0;cpt<borderedIds.length;cpt++){
	    node = nodesIndex[borderedIds[cpt]];
	    if(node){
		delete node.type;
		delete node.borderWidth;
		delete node.borderColor;	
	    }
	}

	// on ajoute la bordure aux nouvelles
	for(cpt = 0; cpt<ids.length; cpt++){

	    node = nodesIndex[ids[cpt]];
	    node.type='border';
	    node.borderWidth = 1.5;
	    node.borderColor = '#f6f6f6';
	}

	this.borderedIds = ids;

    });
    
    // ---------------------- END SIGMA METHODS --------------------------------

    
    // ---------------------- BEGIN CONSTRUTOR ----------------------------------


    load = function(){

	var getGraphIo = math.data.getGetGraphIo(),
	    watchIo = math.data.getWatchIo();

	getGraphIo.on('error',console.log);

	getGraphIo.on('get',function(graph_data){
	    var graph = configMap.sigma.graph;
	    graph.read(graph_data);

	    graph.load();
	    $.gevent.publish('math-graph-loaded');
		$.gevent.publish('math-graph-changes');},5000);

	getGraphIo.emit('get');

	watchIo.on('graph',function(obj){
	    var graph = configMap.sigma.graph;
	    
	    graph.change(obj.data);
	     $.gevent.publish('math-graph-changes');
	});

	watchIo.init('graph');
	watchIo.subscribe(); 
	
    };


    save = function() {
	var graph = configMap.sigma.graph,
	    nodes = graph.nodes(),
	    nodes_position = {},
	    cpt,
	    postGraphIo = math.data.getPostGraphIo();

	for(cpt =0; cpt< nodes.length; cpt++){
	    nodes_position[nodes[cpt].id] = {x:nodes[cpt].x,
					     y:nodes[cpt].y};
	}

	postGraphIo.on('error', console.log);

	postGraphIo.on('post', function(){
	    console.log('posted');
	});

	postGraphIo.emit('post',nodes_position);
    };
    
    //Begin public method /configModule/
    configModule = function( input_map ) {
	math.util.setConfigMap({
	    input_map    : input_map,
	    settable_map : configMap.settable_map,
	    config_map   : configMap
	});

	return true;
    };
    //End public method /configModule/

    var getSigma = function(){return configMap.sigma;};
    
    return {
	s: getSigma,
	load : load,
	save:  save,
	configModule : configModule
    }
    
    // ---------------------  END CONSTRUCTOR -----------------------------------
}());
