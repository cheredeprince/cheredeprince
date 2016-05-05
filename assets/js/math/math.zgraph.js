/*
 * math.graph
 * module de gestion de l'affichage du graphe
 */

math.graph = (function(){


    // ------------------------ BEGIN MODULE SCOPE VARIABLES -------------------------------------

    var
    configMap = {
	main_html : String()
	    +'<div class="math-graph-container">'
	    +'<div class="math-graph-place"></div>'
	        +'<div class="math-graph-wait-please">'
                +'<span class="math-graph-wait-please-message">Un gros graphe en approche &nbsp;!</span>'
	    +'<div class="math-graph-wait-please-img"></div>'
	    +'<svg  xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="math-graph-wait-please-points" viewBox="-20 -20 220 60">'
	    +'<style>    .c{	animation-name: apparition;	animation-duration : 6s;		animation-fill-mode: both;	animation-iteration-count: infinite;	transform-origin: center center;'	
	    +'-moz-transform-origin: center center;    }'
	    +'.c2{	animation-delay: 1s;    }'
	    +'.c3{	animation-delay: 2s;    }'
	    +'.r1{	animation-delay: 0.6s;    }'
	    +'.r2{	animation-delay:1.6s;    }'
	    +'.r{	animation-name: deployement;	animation-duration: 6s;	animation-iteration-count: infinite;	animation-fill-mode: both;	transform-origin: left center;    }'
	    +'@keyframes apparition {'
	    +' 0%{transform: scale(0);opacity:0;}'
	    +'7% {transform: scale(1.2); opacity: 1;	}'
	    +'10% { transform: scale(1);}'
	    +'50% {  transform: scale(1); opacity: 1;	}'
	    +'60%{ opacity:0;	}'
	    +'100%{ transform: scale(0); opacity:0;}'
	    +'}'
	
	    +'@keyframes deployement {'
	    +'0%{ transform: scale(0); opacity:0;}'
	    +'10%{   opacity:1;   transform: scale(1);}'
	    +'50%{  opacity:1; transform: scale(1);}'
	    +'60%{ opacity:0;	}'
	    +'100%{ opacity:0;}'
	    +'  }'
	+'</style>'
	    +'<circle class="c c1" cx="10" cy="10" r="10" style="fill:#889421;"/>'
	    +'<rect class="r r1" x="18" y="9" height="3" width="64" style="fill:#889421" />'
	    +'<circle class="c c2" cx="90" cy="10" r="10" style="fill:#1B791B;"/>'
	    +'<rect class="r r2" x="98" y="9" height="3" width="64" style="fill:#1B791B" />'+'<circle class="c c3" cx="170" cy="10" r="10" style="fill:#985022;"/>'
	    +'</svg>'
	
	    +'</div>'
	    +'</div>'
	    +'</div>'
	
	    +'<div class="math-admin math-graph-admin math-graph-save-btn" title="sauvegarder la position des noeuds">'
	    +'<svg class="math-box-icon">'
	    +'<use xlink:href="#math-save-icon"></use>'
	    +'</svg>'
	    +'</div>'
	    +'<div class="math-admin math-graph-admin math-graph-force-btn" title="lancer l\'algorithme de force pour placer les noeuds">'
	    +'<svg class="math-box-icon">'
	    +'<use xlink:href="#math-force-icon"></use>'
	    +'</svg>'
	    +'</div>'
	    +'<div class="math-admin math-graph-admin math-graph-drag-btn" title="activer le déplacement des noeuds à la souris">'
	    +'<svg class="math-box-icon">'
	    +'<use xlink:href="#math-drag-icon"></use>'
	    +'</svg>'
	    +'</div>'
	,

	settable_map : {
	    graph_model : true,
	    elts_model  : true,
	    sigma       : true,
	    displayElt  : true
	},

	time_label_show : 200,
	neighborhood_min: 3,
	ratio_min       : 0.05,
	graph_model : null,
	elts_model  : null,
	sigma       : null, 
	displayElt  : null
    },
    stateMap  = {
	$container  : null,
	force_start : false,
	label_show  : false,
	timeout_label : null
    },
    jqueryMap = {},

    setJqueryMap, initModule,  configModule, toggleForce, toggleDrag,
    initSigma, zoomOn, zoomOnNeighborhood, zoomOnNames, resetCamera,
    onGraphChange, onClickNode,onEltsChanges, showLabel,hideLabel,onClickDragBtn,onClickSaveBtn,onClickForceBtn, onGraphLoaded;

    // ------------------------ END MODULE SCOPE VARIABLES ------------------------------------------

    // ------------------------ BEGIN UTILITY METHODS ------------------------------------------

    //Begin utility method /initSigma
    initSigma = function(){
	var s = configMap.sigma;
	s.addRenderer({
	    type: 'canvas',
	    container: jqueryMap.$place[0]
	});
	s.refresh();

	//on iniatilise les événements

	s.bind('clickNode',onClickNode);
    }
    
    // End utility method /initSigma
    
    toggleForce = function(){
	var s = configMap.sigma;
	if(stateMap.force_start){
	    stateMap.force_start = false;
	    s.killForceAtlas2();
	}else{
	    s.startForceAtlas2({iterationsPerRender:500,
				adjustSizes: true,
				barnesHutOptimize: false,
				barnesHutTheta: 0.9,
				gravity: 13});
	    stateMap.force_start = true;
	}
	    
    }

    toggleDrag = function(){
	var s = configMap.sigma;
	if(stateMap.drag_start){
	    stateMap.drag_start = false;
	    sigma.plugins.killDragNodes(s);
	}else{
	    new sigma.plugins.dragNodes(s,s.renderers[0]);
	    stateMap.drag_start = true;
	}
    }
    
    // ------------------------ END UTILITY METHODS ------------------------------------------

    // ------------------------ BEGIN DOM METHODS ------------------------------------------
    // Begin DOM method /setJqueryMap/
    setJqueryMap = function () {
	var $background = stateMap.$background;
	jqueryMap = {
	    $background  : $background,
	    $place       : $background.find('.math-graph-place'),
    	    $waitplease  : $background.find('.math-graph-wait-please'),
	    $drag_btn    : $background.find('.math-graph-drag-btn'),
	    $force_btn   : $background.find('.math-graph-force-btn'),
	    $save_btn    : $background.find('.math-graph-save-btn')
		    };
    };
    //End DOM method /setJqueryMap

    //zoom around nodes
    zoomOn = function(nodes){
	var s = configMap.sigma,
	    renderer_width = s.renderers[0].width,
	    renderer_height= s.renderers[0].height,
	    rect_height,
	    rect_width,
	    center_x,
	    center_y,
	    margin_ratio = 0.25,
	    prefix = 'renderer1:',
	    prefix_cam = 'read_cam0:',
	    ratio,
	    cpt,node,minX = Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity,
	    minX_cam= Infinity,minY_cam=Infinity,maxX_cam=-Infinity,maxY_cam=-Infinity;
	//on cherche les dimensions du rectangle contenant les sommets
	// avant les dimensions du renderer
	for(cpt=0;cpt<nodes.length;cpt++){
	    node = nodes[cpt];
	    minX = Math.min(minX,node[prefix+'x']);
	    maxX = Math.max(maxX,node[prefix+'x']);
	    minY = Math.min(minY,node[prefix+'y']);
	    maxY = Math.max(maxY,node[prefix+'y']);
	    minX_cam = Math.min(minX_cam,node[prefix_cam+'x']);
	    maxX_cam = Math.max(maxX_cam,node[prefix_cam+'x']);
	    minY_cam = Math.min(minY_cam,node[prefix_cam+'y']);
	    maxY_cam = Math.max(maxY_cam,node[prefix_cam+'y']);
	}

	//on calcule la taille du rectangle
	rect_height = maxY - minY;
	rect_width  = maxX - minX;

	//on calcule son centre
	center_x = (minX_cam +maxX_cam)/2;
	center_y = (minY_cam + maxY_cam)/2;
	
	ratio = Math.max(Math.max(
	    rect_height / (renderer_height - margin_ratio*renderer_height),
	    rect_width  / (renderer_width - margin_ratio*renderer_width)
	) * s.camera.ratio,
			 configMap.ratio_min);
	if(ratio > 0 && !(s.camera.x == center_x && s.camera.y == center_y && s.camera.ratio == ratio))
	    sigma.misc.animation.camera(s.camera,{x:center_x,y:center_y,ratio:ratio},{duration:800});
	return; 
    }
    
    // ---------------------- END DOM METHODS -------------------------------------------

    // ---------------------- BEGIN EVENT HANDLER ---------------------------------------

    onGraphLoaded = function(){
	jqueryMap.$waitplease.fadeOut("slow");
    };

    onGraphChange = function(){
	configMap.sigma.refresh();
    };

    onEltsChanges = function(event, elts){
	var s = configMap.sigma,
	    names= elts.map(function(elt){
		return elt.name;
	    });
	s.graph.setBorder(names);
	s.refresh();
    };
    
    onClickNode = function( event ){
	//on demande d'afficher la node à shell
	configMap.displayElt(event.data.node.id,{source: 'graph'});
    };

    onClickForceBtn = function( event ){
	toggleForce();
    };


    onClickDragBtn = function( event ){
	toggleDrag();
    };

    onClickSaveBtn = function( event ){
	configMap.graph_model.save();
    };
    
    // ---------------------- END EVENT HANDLER -----------------------------------------   

    // --------------------- BEGIN PUBLIC METHODS --------------------------------------

    resetCamera = function(){
	var s = configMap.sigma;
	sigma.misc.animation.camera(s.camera,{x:0,y:0,ratio:1},{duration:800})
    }

    showLabel = function(name){
	var s = configMap.sigma,
	    node = s.graph.getNode(name);

	stateMap.timeout_label = setTimeout(function(){
	    if(stateMap.label_show)
		s.renderers[0].dispatchEvent('overNode',{node: node });
	},configMap.time_label_show);
	
	stateMap.label_show = true;
    };

    
    hideLabel = function(name){
	var s = configMap.sigma,
	    node = s.graph.getNode(name);
	
	//on supprime l'ancien timeout 
	clearTimeout(stateMap.timeout_label)
	stateMap.label_show = false;

	s.renderers[0].dispatchEvent('outNode',{node: node });
    }
    
    zoomOnNeighborhood = function(name){
	var s = configMap.sigma,
	    nodes = s.graph.getNeighbors(name),
	    extraNeighborhood = [],
	    cpt;
	// on a moins d'un certain nombre d'éléments dans le voisionnage du sommet
	// on ajoute le voisinage du voisinage
	if(nodes.length < configMap.neighborhood_min){
	    for(cpt = 0; cpt<nodes.length;cpt++){
		extraNeighborhood = extraNeighborhood.concat(s.graph.getNeighbors(nodes[cpt].id));
	    }
	}
	nodes = nodes.concat(extraNeighborhood);
	nodes.push(s.graph.getNode(name));
	
	zoomOn(nodes);
    };

    zoomOnNames = function(names){
	var s = configMap.sigma,
	    nodes = s.graph.getNode(names);
	if(names.length == 1){
	    zoomOnNeighborhood(names[0]);
	}
	if(names.length>1){
	    zoomOn(nodes);
	}
    };

    
    configModule = function( input_map ) {
	math.util.setConfigMap({
	    input_map    : input_map,
	    settable_map : configMap.settable_map,
	    config_map   : configMap
	});
	return true;
    };
    //End public method /configModule/

    //Begin public method /initModule/
    initModule = function($background){
	stateMap.$background = $background;
	$background.html( configMap.main_html );
	setJqueryMap();
	
	initSigma();
	
	jqueryMap.$drag_btn.click(onClickDragBtn);
	jqueryMap.$force_btn.click(onClickForceBtn);
	jqueryMap.$save_btn.click(onClickSaveBtn);
	$.gevent.subscribe($background,'math-graph-changes',onGraphChange);
	$.gevent.subscribe($background,'math-graph-loaded',onGraphLoaded);
	$.gevent.subscribe($background,'math-elts-changes',onEltsChanges);
	$.gevent.subscribe($background,'math-elts-refresh',resetCamera);
    };
    
    //End public method /initModule/
    
    // -------------------- END PUBLIC METHODS ----------------------------------------

    // End Public method /initMethod
    return {initModule        : initModule,
	    configModule      : configModule,
	    toggleForce       : toggleForce,
	    toggleDrag        : toggleDrag,
	    zoomOnNeighborhood: zoomOnNeighborhood,
	    zoomOn            : zoomOnNames,
	    showLabel         : showLabel,
	    hideLabel         : hideLabel,
	    reset             : resetCamera
	   };
    // ------------------------ END PUBLIC METHODS  ------------------------------------------
}());
    
