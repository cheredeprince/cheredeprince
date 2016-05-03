/*
 * math.aside.js
 * module de l'espace de navigation
 */

math.aside = (function () {
    //---------------------BEGIN MODULE SCOPE VARIABLE -----------------------------------
    var
    configMap = {
	main_html: String()
	    +'<div class="math-aside-panels">'
	    
	    +'<div class="math-aside-homepanel">'

	    +'<header class="header" role="banner">'
	    +'<span class="site-name">Chère de Prince</span>'
	    +'<div class="logo-lead-in">'
	    +'<div>'
	    +'<a href="/">'
	    +'<picture class="logo">'
            +'<source type="image/svg+xml" srcset="/images/global/logo.svg">'
	    +'<img src="/images/global/logo.png" alt="Chère de Prince, le site officiel de la Bécasse">'
	    +'</picture>'
	    +'</a>'
	    +'<div class="lead-in-container">'
	    +'<p class="lead-in text">'
	    +'Tu es sur le site d\'une mangeuse de vers de terre. Penses-y au moment du pourboire ! ;)'
	    +'</p>'
	    +'<div class="stroke sprite-icon">'
	    +'</div>'
	    +'</div>'
	    +'</div>'
	    +'</div>'
	    +'<div class="nav-container">'
	    +'<nav id="nav" class="nav">'
	    +'<ul class="nav-list inline-list">'
	    +'<li><a href="/">Accueil</a></li>'
	    +'<li><a href="/math"  class="active">Math</a></li>'
	    +'<li><a href="/blog">Blog</a></li>'
	    +'<li><a href="/contact">Contact</a></li>'
	    +'</ul>'
	    +'</nav>'
	    +'</div>'
	    +'</header>'
	    +"<p>La petite constellation que tu vois, c'est le résultat d'un projet visant à représenter les relations, existant au sein d'un ensemble d'énoncés mathématiques.</p>"


	    +"<h2>L'objectif de <em>Chère de Prince</em></h2>"
	    +"<p><em>Chère de Prince</em> souhaite devenir un point de rencontre entre les différentes publications parlant de mathématique. Chaque rédacteur du web pourrait faire mention des énoncés, qu'il utilise dans son texte, au sein du graphe. Ainsi, un article mathématique pourrait renseigner précisément son sujet, les énoncés dont il parle. De plus, il serait connecté à un base d'énoncés et articles proches.</p>"
	    +"<p>D'autre part, <em>Chère de Prince</em> bâtit une structure sémantique sur une base de données pleine d'énoncés mathématiques, pour faciliter leur exploration et leur compréhension. Une telle base de données ne peut naître, que grâce à la contribution d'une communauté active ;). C'est pourquoi, ce site a pour vocation d'être un lieu d'échanges et de discussion.</p>"

	    +"<h2>Qu'est-ce que ce graphe ?</h2>"

	    +"<p>Ce graphe représente les énoncés mathématiques inscrits sur <em>Chère de Prince</em>. En effet, on peut voir des connaissances mathématiques comme un grand réseau. Si chaque énoncé est un sommet, il peut être relié aux sommets représentant des notions qu'il utilise. Par exemple, la définition de sous-groupe utilise la notion du groupe. Tous ces énoncés sont en dépendance les uns envers les autres.</p>"

	+"<img alt=\"définitions (en vert sur le graphe), théorèmes (rouge), propriètés (bleu), lemmes (violet), corollaires (marron), axiomes (jaune). \" src=\"/images/global/legende.svg\"/>"
	    +"<h2>Comment collaborer ?</h2>"

	    +"<p>Le but de <em>Chère de Prince</em> est d'ouvrir la rédaction à toute personne souhaitant partager et mettre en relation ses connaissances mathématiques. Seulement, le site est aujourd'hui a son commencement, et ne possède pas encore de gestionnaire de contenu pratique pour les contributions. Il est tout de même possible de me <a href=\"/contact\">contacter</a> pour rédiger des énoncés.</p><p>Si tu es plus à l'aise avec le code, qu'avec les mathématiques, une aide informatique est aussi la bienvenue. Je t'invite à consulter mon <a href=\"https://github.com/emixam150/cheredeprince\">Github</a>.</p>"

	    +"<ul>"
	    +"<li>Twitter : <a href=\"https://twitter.com/CheredePrince\">@CheredePrince</a></li>"
	    +"<li>Facebook : <a href=\"https://www.facebook.com/cheredeprince\">La Bécasse</a></li>"
	    +"<li>Github : <a href=\"https://github.com/emixam150/cheredeprince\">le dépot</a></li>"
	+"</ul>"

	    +'</div>'
	    +'<div class="math-aside-eltspanel">'

	    +'</div>'
	    +'<div class="math-aside-singleeltpanel">'
	    +'</div>'
	    +'</div>'
	    +'<div class="math-aside-tongues">'
	    +'<div class="math-aside-tongue math-aside-tongue-elts" title="accéder à la liste des éléments sélectionnés">'
	    +'<div class="icon-button">'
	    +'<svg viewBox="0 0 780 780">'
	    +'<use xlink:href="#math-menu-icon"></use>'
	    +'</svg>'
	    +'</div>'
	    +'</div>'
	    +'<div class="math-aside-tongue math-aside-tongue-home" title="accéder au panneau des informations">'
	    +'<div class="icon-button">'
	    +'<svg viewBox="0 0 780 780">'
	    +'<use xlink:href="#math-nid-icon"></use>'
	    +'</svg>'
	    +'</div>'
	    +'</div>'
	    +'</div>'
	
	    + '<header class="math-aside-header">'
	    +'<div class="math-aside-btn math-aside-headleftbtn">'
	    +'<div class="icon-button">'
	    +'<svg viewBox="0 0 780 780">'
	    +'<use xlink:href="#math-fleche-close-icon"></use>'
	    +'</svg>'
	    +'</div>'
	    +'</div>'
	    +'<h2 class="math-aside-title"></h2>'
	    +'<div class="math-aside-btn math-aside-headrightbtn">'
	    +'<div class="icon-button">'
	    +'<svg viewBox="0 0 780 780">'
	    +'<use xlink:href="#math-corbeille-icon"></use>'
	    +'</svg>'
	    +'</div>'
	    +'</div>'
	    +'</header>',
	settable_map: {
	    slider_open_time  : true,
	    slider_close_time : true,
	    panel_home_title  : true,
	    panel_elts_title  : true,

	    math_elts_model   : true,
	    set_aside_anchor  : true,
	    set_panel_anchor  : true,
	    show_elt          : true
	},

	slider_open_time  : 250,
	slider_close_time : 100,
	panel_home_title  : "",
	panel_elts_title  : "Éléments",
	
	math_elts_model   : null,
	set_aside_anchor  : null,
	set_panel_anchor  : null,
	show_elt          : null
    },
    
    stateMap  = { $container       : null,
		  position_type    : null,
		  is_slider_locked : null,
		  current_panel    : null
		},
    jqueryMap = {},

    setJqueryMap, configModule, setSliderPosition, setPanel,
    onClickHomeTongue, onClickEltsTongue, onClickLeftBtn, initModule,lockSliderOpened,
    handleResize, scrollTo;

    //---------------------END MODULE SCOPE VARIABLE -----------------------------------

    //---------------------BEGIN UTILITY METHODS  -----------------------------------

    //---------------------END UTILITY METHODS  -----------------------------------

    //---------------------BEGIN DOM METHODS  -----------------------------------
        // Begin DOM method /setJqueryMap/
    setJqueryMap = function () {
	var $slider = stateMap.$slider;
	jqueryMap = { $slider          : $slider,
		      $panels          : $slider.find('.math-aside-panels'),
		      $home_panel      : $slider.find('.math-aside-homepanel'),
		      $elts_panel      : $slider.find('.math-aside-eltspanel'),
		      $singleelt_panel : $slider.find('.math-aside-singleeltpanel'),
		      $leftbtn         : $slider.find('.math-aside-headleftbtn'),
		      $rightbtn        : $slider.find('.math-aside-headrightbtn'),
		      $title           : $slider.find('.math-aside-title'),
		      $elts_tongue     : $slider.find('.math-aside-tongue-elts'),
		      $home_tongue     : $slider.find('.math-aside-tongue-home')
		    };
    };
    //End DOM method /setJqueryMap

    //Begin dom method /lockSliderOpened/
    //Purpose  : lock or unlock the slider
    // arg : boolean
    // return : true
    lockSliderOpened = function( is_locked ){
	var set_aside_anchor = configMap.set_aside_anchor;
	if(is_locked){
	    stateMap.is_slider_locked = true;
	    set_aside_anchor('opened',null,true);
	}else{
	    stateMap.is_slider_locked = false;
	}
	return true;
    }    
    //End dom method /lockSliderPositon/
    

    //Begin public method /setSliderPosition/
    // args : * position type : 'closed', 'opened'
    //        * callback (optional)
    //
    // return: * true if the requested position is archieved
    //         * false else
    // throws : none

    setSliderPosition = function(position_type, cb, forced){
	var animate_time, position_css,search_visible,tongues_show;

	// retourne true si on est sur la bonne position
	if(stateMap.position_type === position_type ){
	    return true;
	}
	else{
	    //si le slider est bloqué et initialisé sans forcer
	    if(!forced && stateMap.is_slider_locked && stateMap.position_type !== null && position_type !== 'opened'){
		return false;
	    }
	}

	//prepare les paramètres d'animations
	switch( position_type ){
	case 'opened' :
	    animate_time = configMap.slider_open_time;
	    position_css = {left: 0};
	    tongues_show = (stateMap.is_slider_locked !== null)?stateMap.is_slider_locked:true; 
	    break;
	case 'closed':
	    animate_time = configMap.slider_close_time;
	    position_css = {left: '-100%'};
	    tongues_show = true;
	    break;
	default:
	    return false;
	}

	//animate slider postion change
	stateMap.position_type = '';
	
	jqueryMap.$slider.animate(
	    position_css,
	    animate_time,
	    function(){
		//on cache ou montre les languettes
		if(!tongues_show){

		    jqueryMap.$elts_tongue.hide();    
		    jqueryMap.$home_tongue.hide();
		}else{

		    jqueryMap.$elts_tongue.show();    
		    jqueryMap.$home_tongue.show();
		}
		
		search_visible = (stateMap.current_panel == 'elts'
				  || position_type == 'closed' );
		math.search.setVisibility( search_visible );
		
		stateMap.position_type = position_type;
		if( cb ){ cb(jqueryMap.$slider)}
	    })
	return true;
    }
    //End public method /setSliderPosition/

    //Begin public method /setPanel/
    setPanel = function( panel_name ){
	var left_btn_visible,right_btn_visible,title,search_visible;

	if(stateMap.current_panel === panel_name){
	    return true;
	}
	    
	
	//vars config values
	switch( panel_name ){
	case 'home':
	    left_btn_visible = !stateMap.is_slider_locked;
	    right_btn_visible = false;
	    title = configMap.panel_home_title;
	    search_visible = false;
	    break;
	case 'elts':
	    left_btn_visible = !stateMap.is_slider_locked;
	    right_btn_visible = true;
	    title = configMap.panel_elts_title;
	    search_visible = true;
	    break;
	case 'single_elt':
	    left_btn_visible = !stateMap.is_slider_locked;
	    right_btn_visible = false;
	    title = configMap.panel_home_title;
	    search_visible = false;
	    break;
	default:
	    return false;
	}

	// display 
	switch(panel_name){
	case 'home':
	    jqueryMap.$home_panel.show()
	    jqueryMap.$elts_panel.hide()
	    jqueryMap.$singleelt_panel.hide()
	    break;
	case 'elts':
	    jqueryMap.$home_panel.hide()
	    jqueryMap.$elts_panel.show()
	    jqueryMap.$singleelt_panel.hide()

	    break;
	case 'single_elt':
	    jqueryMap.$home_panel.hide()
	    jqueryMap.$elts_panel.hide()
	    jqueryMap.$singleelt_panel.show()
	    break;
	}
	
	if(left_btn_visible)
	    jqueryMap.$leftbtn.show();
	else
	    jqueryMap.$leftbtn.hide()

	if(right_btn_visible)
	    jqueryMap.$rightbtn.show();
	else
	    jqueryMap.$rightbtn.hide()

	jqueryMap.$title.text(title)
	math.search.setVisibility(search_visible);

	stateMap.current_panel = panel_name;
	return true;

    }
    //End public method /setPanel/
    
    //---------------------END DOM METHODS  -----------------------------------

    
    // ------------------------ BEGIN EVENT HANDLERS -------------------------------

    onClickHomeTongue = function( event ) {
	configMap.set_panel_anchor( 'home', 'opened' )
	return false;
    }

    onClickEltsTongue = function( event ) {
	configMap.set_panel_anchor( 'elts', 'opened' )
	return false;
    }

    onClickLeftBtn = function( event ){
	var set_aside_anchor = configMap.set_aside_anchor;
	if(stateMap.position_type == 'opened'){
	    set_aside_anchor('closed')
	}
	return false;
    }

    
    // ------------------------ END EVENT HANDLERS ------------------------------------------
    // ------------------------ BEGIN PUBLIC METHODS ------------------------------------------


    
    
    //Begin public method /scrollTo/
    scrollTo = function(name){
	var elt = configMap.math_elts_model.get_by_name(name);
	if(elt){
	    jqueryMap.$panels.scrollTo( $("#"+name), 800,{offset:{top: -64} });	    
	}else{
	    return false;
	}

	return true;
    }
    //End public method /scrollTo/
    
    //Begin public method /configModule/
    //Purpose     : Adjust configuration of allowed keys
    //Arguments   : A map of settable keys and values
    //   * color_name - color to use
    //Settings    :
    //   * configMap.settable_map declares allawed keys
    //Returns     : true
    //Throws      : none

    configModule = function( input_map ) {
	math.util.setConfigMap({
	    input_map    : input_map,
	    settable_map : configMap.settable_map,
	    config_map   : configMap
	})
	return true;
    }
    //End public method /configModule/

    //Begin public method /initModule/
    initModule = function( $slider ) {
	$slider.html( configMap.main_html );
	stateMap.$slider = $slider;
	setJqueryMap();

	jqueryMap.$home_tongue.click(onClickHomeTongue);
	jqueryMap.$elts_tongue.click(onClickEltsTongue);
	jqueryMap.$leftbtn.click(onClickLeftBtn);

	setPanel( 'elts')

	math.aside.elts.configModule({
	    math_elts_model : configMap.math_elts_model,
	    show_elt        : configMap.show_elt,
	    scrollTo        : scrollTo
	})

	math.aside.elts.initModule(jqueryMap.$elts_panel,jqueryMap.$rightbtn)
	
	return true;
    };
    //End public method /initModule/

    //Begin public method /handleResize/
    handleResize = function( is_lock_opened ){

	if(stateMap.is_slider_locked && !is_lock_opened && stateMap.position_type == "opened"){
	    //on devient petit et ouvert
	    jqueryMap.$elts_tongue.hide();    
	    jqueryMap.$home_tongue.hide();
	}
	if(!stateMap.is_slider_locked && is_lock_opened && stateMap.position_type == "opened"){
	    jqueryMap.$elts_tongue.show();    
	    jqueryMap.$home_tongue.show();
	}
	
	lockSliderOpened( is_lock_opened );
	if(!is_lock_opened)
	    jqueryMap.$leftbtn.show()
	else
	    jqueryMap.$leftbtn.hide()
    };
    //End public method //
    
    //return public Methods
    return {
	configModule       : configModule,
	initModule         : initModule,
	setSliderPosition  : setSliderPosition,
	setPanel           : setPanel,
	handleResize       : handleResize,
	scrollTo           : scrollTo
    }

    // ------------------------ END PUBLIC METHODS  ------------------------------------------
}())
