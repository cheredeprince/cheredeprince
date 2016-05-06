/*
* math.shell.js
* Module shell de math
 */

math.shell = (function(){


    // ------------------------ BEGIN MODULE SCOPE VARIABLES ------------------------------------------

    var
    configMap = {
        main_html : String()
        + '<div class="math-graph" id="math-graph"></div>'
        +'<aside class="math-aside">'
        +'</aside>'
        +'<div class="math-search"></div>',
        main_bp_width      : 50*16,
        redsize_interval   : 200,

        aside_extend_time  : 500,
        aside_retract_time : 300,

        anchor_schema_map:{
            aside: {opened: true, closed: true},
            panel: {home  : true, elts  : true, single_elt: true },
            elts:  {set   : true, empty : true },
            _elts: true
        }
    },
    stateMap  = {
        $container         : null,
        is_little          : null,
        anchor_map: {},
        resize_idto: null,
        sigma: null,
    },
    jqueryMap = {},

    setJqueryMap,        initModule,
    onResize, copyAnchorMap,
    changeAnchorPart,   onHashchange,
    onEltsChanges,
    setAsideAnchor, setPanelAnchor, setPanelAsideAnchor,displayElt,showElt, normallight_elt, highlight_elt;

    // ------------------------ END MODULE SCOPE VARIABLES ------------------------------------------

    // ------------------------ BEGIN UTILITY METHODS ------------------------------------------

    copyAnchorMap = function(){
        return $.extend( true, {}, stateMap.anchor_map);
    }

    // ------------------------ END UTILITY METHODS ------------------------------------------

    // ------------------------ BEGIN DOM METHODS ------------------------------------------
    // Begin DOM method /setJqueryMap/
    setJqueryMap = function () {
        var $container = stateMap.$container;
        jqueryMap = { $container   : $container,
                      $aside       : $container.find('.math-aside'),
                      $search      : $container.find('.math-search'),
                      $graph       : $container.find('.math-graph')
                    };
    };
    //End DOM method /setJqueryMap

    //Begin DOM method /changeAnchorPart
    changeAnchorPart = function ( arg_map ) {

        var
        anchor_map_revise = copyAnchorMap(),
        bool_return = true,
        key_name, key_name_dep ;

        //Begin merge changes into anchor map
        KEYVAL:
        for( key_name in arg_map){
            if(arg_map.hasOwnProperty(key_name)){

                //skip dependent keys during iteration
                if(key_name.indexOf('_') === 0){ continue KEYVAL; }

                //update independent key value
                anchor_map_revise[key_name] = arg_map[key_name];

                //update matching dependent key
                key_name_dep = '_' + key_name;
                if( arg_map[key_name_dep] ){
                    anchor_map_revise[key_name_dep] = arg_map[key_name_dep];
                }
                else{
                    delete anchor_map_revise[key_name_dep];
                    delete anchor_map_revise['_s'+ key_name_dep]
                }
            }
        }
        //End merge changes into anchor map

        //Begin attempt to update URI; revert if not sucessful
        try{
            $.uriAnchor.setAnchor( anchor_map_revise );
        }catch ( error ){

            //replace URI with existing state
            //$.uriAnchor.setAnchor( stateMap.anchor_map, null,true);
            bool_return = false;
        }
        //end attempt to update URI

        return bool_return;

    }
    //End DOM method /changeAnchorPart
    // ------------------------ END DOM METHODS ------------------------------------------

    // ------------------------ BEGIN EVENT HANDLERS ------------------------------------------

    //Begin Event handler /onHashchange
    onHashchange = function( event ) {
        var
        anchor_map_previous = copyAnchorMap(),
        anchor_map_proposed,
        _s_aside_previous, _s_aside_proposed,
        s_aside_proposed, is_aside_ok = true,

        _s_panel_previous, _s_panel_proposed,
        s_panel_proposed, is_panel_ok = true,

        _s_elts_previous, _s_elts_proposed,
        s_elts_proposed,_elts_proposed,_elts_previous;

        //attempt to parse anchor
        try{ anchor_map_proposed = $.uriAnchor.makeAnchorMap();}
        catch ( error ) {

            $.uriAnchor.setAnchor( anchor_map_previous)
            return false;
        }

        stateMap.anchor_map = anchor_map_proposed;
        //convenience vars
        _s_aside_previous = anchor_map_previous._s_aside
        _s_aside_proposed = anchor_map_proposed._s_aside

        //Begin adjust aside component if changed
        if(! anchor_map_previous || _s_aside_previous !== _s_aside_proposed){
            s_aside_proposed = anchor_map_proposed.aside;
            switch( s_aside_proposed ) {
            case 'opened' :
                is_aside_ok = math.aside.setSliderPosition('opened')
                break;
            case 'closed' :
                is_aside_ok = math.aside.setSliderPosition('closed')
                break;
                default :
                math.aside.setSliderPosition('closed')
                delete anchor_map_proposed.aside;
                $.uriAnchor.setAnchor( anchor_map_proposed,null,true);
            }
        }
        //End adjust aside component if changed

        //Begin revert anchor if slider change denied
        if(! is_aside_ok && false) {
            if(anchor_map_previous){
                stateMap.anchor_map = anchor_map_previous;
                $.uriAnchor.setAnchor( anchor_map_previous,null,true );
            }else {
                delete anchor_map_proposed.aside;
                $.uriAnchor.setAnchor(anchor_map_proposed, null, true)
            }
        }
        //End revert aside component if changed


        _s_panel_previous = anchor_map_previous._s_panel
        _s_panel_proposed = anchor_map_proposed._s_panel

        //Begin adjust panel component if changed
        if(! anchor_map_previous || _s_panel_previous !== _s_panel_proposed){
            s_panel_proposed = anchor_map_proposed.panel;
            switch( s_panel_proposed ) {
            case 'home' :
                is_panel_ok = math.aside.setPanel('home')
                break;
            case 'elts' :
                is_panel_ok = math.aside.setPanel('elts');
                break;
            case 'single_elt':
                is_panel_ok = math.aside.setPanel('single_elt');
                break;
            default:
                math.aside.setPanel('elts')
                delete anchor_map_proposed.panel;
                $.uriAnchor.setAnchor( anchor_map_proposed,null,true);
            }
        }
        //End adjust panel component if changed

        //Begin revert anchor if panel change denied
        if(! is_panel_ok) {
            if(anchor_map_previous){
                stateMap.anchor_map = anchor_map_previous;
                $.uriAnchor.setAnchor( anchor_map_previous,null,true );
            }else {
                delete anchor_map_proposed.panel;
                $.uriAnchor.setAnchor(anchor_map_proposed, null, true)
            }
        }
        //End revert panel component if changed


        _s_elts_previous = anchor_map_previous._s_elts
        _s_elts_proposed = anchor_map_proposed._s_elts

        //Begin adjust elts component if changed
        if(! anchor_map_previous || _s_elts_previous !== _s_elts_proposed){
            s_elts_proposed = anchor_map_proposed.elts;
            _elts_proposed = anchor_map_proposed._elts;
            _elts_previous = anchor_map_previous._elts;
            // s'il y a des elts dans l'url
            if(s_elts_proposed == 'set'
               && typeof _elts_proposed == 'object'){
                //on demande si les éléments sont chargés et sinon on les chargent
                if(math.model.Elts.is_loaded(_elts_proposed)){
                    ;
                }else{
                    math.model.Elts.load(_elts_proposed);

                    if(_s_elts_previous){
                        anchor_map_proposed.elts = anchor_map_previous.elts
                        anchor_map_proposed._elts = anchor_map_previous._elts
                        anchor_map_proposed._s_elts = anchor_map_previous._s_elts

                        stateMap.anchor_map = anchor_map_proposed;
                        //$.uriAnchor.setAnchor( anchor_map_proposed,null,true );
                    }else{
                        anchor_map_proposed.elts = 'empty';
                        delete anchor_map_proposed._elts
                        delete anchor_map_proposed._s_elts;

                        stateMap.anchor_map = anchor_map_proposed;
                        $.uriAnchor.setAnchor( anchor_map_proposed,null,true );
                    }
                }
            }else if(s_elts_proposed == 'empty'){
                math.model.Elts.reset()
            }
            //End adjust elts component if changed
        }
         return false;
    }
    //End Event handler /onHashchange

    //Begin Event handler /onResize/
    onResize = function( event ){
        if(stateMap.resize_idto ) { return true;}

        stateMap.is_little = jqueryMap.$container.width() <= configMap.main_bp_width;
        math.aside.handleResize(! stateMap.is_little);

        stateMap.resize_idto = setTimeout(function(){
            stateMap.resize_idto = null;

        },configMap.resize_interval)
    }
    //End Event handler /onResize/

    //Begin Event handler /onEltsChanges/
    onEltsChanges = function(event, elts){
        var stateEltsURI = {},key,returned_URI;
        //on transforme en objet pour l'URL

        for(key=0;key<elts.length;key++){
            stateEltsURI[elts[key].name] = (elts[key].selected)?1:0;
        }
        returned_URI = (elts.length !== 0)? { elts: 'set' ,_elts: stateEltsURI }:{elts:'empty'};

        return changeAnchorPart(returned_URI)
    }
    //End Event handle /onEltsChanges/


    // ------------------------ END EVENT HANDLERS ------------------------------------------

    // ------------------------ BEGIN CALLBACKS ------------------------------------------
    //Begin callback method /setAsideAnchor/
    //Exemple : setAsideAnchor( 'closed')
    // change the chat component of the anchor
    // args: * position_type
    //  returns: true if anchor updated
    //             false else
    setAsideAnchor = function(position_type){
        return changeAnchorPart({ aside : position_type })
    };
    //End callback method /setAsideAnchor/


    //Begin callback method /setPanelAnchor/
    setPanelAnchor = function(panel_name){
        return changeAnchorPart({panel : panel_name,aside: 'opened'})
    };
    //End callback method /setPanelAnchor/

    //Begin callback method /displayElt/
    displayElt = function(name,event){
        //si l'élément n'existe pas dans aside.elts lancer une recherche
        if(!math.aside.scrollTo(name)){
            math.model.Elts.find_by_name(name,null,event);
        }
    };
    //End callback method /displayElt/


    //Begin callback method /displayElt/
    showElt = function(names){
        if(typeof names == 'string'){
            math.graph.zoomOnNeighborhood(names);
        }else if(Array.isArray(names)){
            math.graph.zoomOn(names);
        }

    };
    //End callback method /displayElt/

    highlight_elt = function(name){
        math.graph.showLabel(name);
    };

    normallight_elt = function(name){
        math.graph.hideLabel(name);
    };

    // ------------------------ END CALLBACKS  ------------------------------------------

    // ------------------------ BEGIN PUBLIC METHODS ------------------------------------------
    //Begin Public method /initMethod
    initModule = function($container){
        var anchor_map;
        stateMap.$container = $container;
        $container.html( configMap.main_html );
        setJqueryMap();

        stateMap.is_little = jqueryMap.$container.width() <= configMap.main_bp_width;

        //creation sigma Instance

        stateMap.sigma = new sigma({
            settings:{
                font: "HelveticaNeue,Helvetica,Arial,sans-serif",
                batchEdgesDrawing: true,
                canvasEdgesBatchSize: 300,
                defaultLabelColor: '#f6f6f6',
                defaultNodeColor : '#fff',
                hoverFont : '"Arial Black", Gadget, "Ubuntu Mono Bold","Lato Black", sans-serif',
                defaultHoverLabelBGColor: '#f6f6f6',
                labelHoverShadowColor : '#1f1f1f'
            }
        });

        //configure uriAnchor to use our shema
        $.uriAnchor.configModule({
            schema_map : configMap.anchor_schema_map
        });

        //iniatilize feature modules
        math.aside.configModule({
            set_aside_anchor       : setAsideAnchor,
            set_panel_anchor       : setPanelAnchor,
            math_elts_model        : math.model.Elts,
            show_elt               : showElt
        });

        math.graph.configModule({
            sigma                  : stateMap.sigma,
            graph_model            : math.model.Graph,
            elts_model             : math.model.Elts,
            displayElt             : displayElt
        });

        math.model.Graph.configModule({
            sigma                  : stateMap.sigma
        });

        math.aside.elts.configModule({
            highlight_elt         : highlight_elt,
            normallight_elt       : normallight_elt
        });

        math.model.initModule();

        math.aside.initModule(jqueryMap.$aside);

        math.search.initModule(jqueryMap.$search);

        math.graph.initModule(jqueryMap.$graph);

        //initialize global event
        $.gevent.subscribe($container,'math-elts-changes',onEltsChanges);


        // Handle URI anchor events
        $(window).bind('hashchange',onHashchange)
            .trigger('hashchange');

        //initialize size events
        $(window).resize( onResize )
            .trigger('resize');
        // si un elt est à charger on le charge
        if(elt_to_load)
            math.model.Elts.find_by_name(elt_to_load);
    };
    // End Public method /initMethod
    return {initModule        : initModule};
    // ------------------------ END PUBLIC METHODS  ------------------------------------------
}());
