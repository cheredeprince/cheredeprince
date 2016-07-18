/*
 * math.search.js 
 * Module search de math
 */

math.search = (function(){

    // ------------------------ BEGIN MODULE SCOPE VARIABLES --------------------------------------
    var
    configMap= {
	main_html : String()
	    +'<form id="math-search-form" action="#" method="post" class="inline-form search-form">'
	    +'<fieldset>'
	    +'<label for="math-search-input" class="is-vishidden">Rechercher dans le graphe</label>'
	    +'<input type="search" placeholder="Rechercher dans le graphe" id="math-search-input" class="search-field" autofocus="autofocus" />'
	    +'<button class="search-submit btn sucess">'
	    +'<span class="icon-search" aria-hidden="true">'
	    +'<svg viewBox="0 0 780 780">'
	    +'<use xlink:href="#math-loupe-icon"></use>'
	    +'</svg>'
	    +'</span>'
	    +'</button>'
	    +'</fieldset>'
	    +'</form>'

    },

    stateMap = {
	$bar       : null,
	is_visible : true
	
    },
    jqueryMap = {},
    setJqueryMap, initModule, setVisibility, onSelect, onSubmit;
    // ------------------------ END MODULE SCOPE VARIABLES  ---------------------------------------

    // ------------------------ BEGIN DOM METHODS ------------------------------------------

    setJqueryMap = function(){
	var $bar = stateMap.$bar;
	jqueryMap = {
	    $bar   : $bar,
	    $input : $bar.find('#math-search-input'),
	    $form  : $bar.find('#math-search-form')
	}
    }
    
    setVisibility = function(is_visible){
	if(stateMap.is_visible == is_visible)
	    return true;
	if(is_visible){
	    jqueryMap.$bar.show();
	    stateMap.is_visible = true;
	}else{
	    jqueryMap.$bar.hide();
	    stateMap.is_visible = false;
	}
	return true;
    }

    // autocompletion pour les maths
    $.widget( "custom.mathcomplete", $.ui.autocomplete, {
	_create: function() {
	    this._super();
	    // on définit les éléments sélectionnables
	    this.widget().menu( "option", "items", ".math-search-comp-sugg" );
	        
	},
	_renderMenu: function( ul, items ) {
	    
	    var that = this,
		currentCategory = 'comp';
	    ul.addClass('math-search-comp');
	    //on place le titre de la catégorie suggestion
	    ul.append( "<li class='math-search-comp-category'>Suggestions</li>" );
	    //pour chaque donnée
	    $.each( items, function( index, item ) {
		var li;
		//si on a à faire au premier elt mathématique
		if ( currentCategory == 'comp' && typeof item.label !== 'string'  ) {
		    ul.append( "<li class='math-search-comp-category'>Éléments</li>" );
		    currentCategory = 'sugg';
		}
		//on traite la construction de l'item
		li = that._renderItemData( ul, item );		      
	    });
	        
	},
	_renderItem: function( ul, item ) {
	    //si on a une suggestion
	    if(typeof item.label == 'string')
		return $( "<li>" )
		.addClass("math-search-comp-sugg")
	        .append( item.label )
	        .appendTo( ul );
	    else{
		//on a un elt
		return $( "<li>" )
		    .addClass("math-search-comp-sugg")
		    .addClass("math-elt-mini")
		    .addClass("math-elt")
	            .append( '<span class="elt-dot-type" style="color:'+math.typeColor(item.type) +'">●</span>' )
		    .append('<span class="elt-title">'+ item.title +'</span>')
		    .append('<span class="elt-name elt-info-text">'+ item.name +'</span>')
	            .appendTo( ul );
	    }
	},
	_resizeMenu: function() {
	    this.menu.element.outerWidth( jqueryMap.$bar.width() );
	}
    })
    
    // ------------------------ END DOM METHODS ------------------------------------------

    // ------------------------ BEGIN EVENT HANDLERS ------------------------------------------

    
    onSelect = function(event, ui){
	var item = ui.item;
	//si item est un elt, on lance sa recherche
	if(typeof item.label !== 'string'){
	    math.model.Elts.find_by_name(item.name);
            // on supprime le focus
	    jqueryMap.$input.blur();
            //on ferme le menu
	    setTimeout(function(){jqueryMap.$input.mathcomplete('close');},500);
	}else{
	    jqueryMap.$input.val(item.label.trim());
	    // on supprime le focus
	    jqueryMap.$input.blur();
	    jqueryMap.$input.submit();
	}
	    
	return false;
    };

    onSubmit = function(event){
	var query = jqueryMap.$input.val();

	if(query !== ''){
	    math.model.Elts.search(query);
	}

	jqueryMap.$input.mathcomplete("close");
	return false;
    };
    
    // ------------------------ END EVENT HANDLERS ------------------------------------------

    // ------------------------ BEGIN PUBLIC METHODS ------------------------------------------

    initModule = function($bar){
	$bar.html(configMap.main_html);
	stateMap.$bar = $bar;
	setJqueryMap();

	jqueryMap.$form.submit(onSubmit);
	
	jqueryMap.$input.mathcomplete({
	    delay: 300,
	    minLength: 2,
	    source: function(req,res){
		var completionIo = math.data.getCompletionIo();

		completionIo.on('error',function(message){
		    console.error(message);
		    res([]);
		});

		completionIo.on('complete', function(data){
		    var goodData = [],key;
		    //on ajoute les completions
		    for(key in data.comp)
			goodData.push(data.comp[key]);
		    //on ajoute les suggestions d'elts
		    for(key in data.sugg)
			goodData.push(data.sugg[key]);
		    
		    res(goodData);
		});

		completionIo.emit('complete',{term: req.term});
	    },
	    select: onSelect
	});
	
    };
    
    return {
	initModule    : initModule,
	setVisibility : setVisibility
    };
    // ------------------------ END PUBLIC METHODS  ------------------------------------------
}())
