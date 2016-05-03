math.aside.elts.admin = function($box,mini){
    var
    configMap = {
	main_html: String()
	    +'<div class="math-box math-elt">'
	    +'<div class="object">'

	    +'<div class="math-box-para">'
	    +'</div>'

	    +'<div class="math-box-delete-btn">'
	    +'<svg class="math-box-icon">'
	    +'<use xlink:href="#math-delete-icon"></use>'
	    +'</svg>'
	    +'</div>'

	    +'<div class="math-box-content text">'
	    +'</div>'

	    +'<div class="math-box-bottom">'
	
	    +'</div>'
	    +'</div>'
	    +'</div>'
	,
	settable_map: {
	    box_open_time    : true,
	    box_close_time   : true,
	    box_close_length : true,

	    math_elts_model : true,
	    type            : true,
	    elt_data        : true,
	    elt_id          : true,
	    before_close    : true
	},

	box_open_time    : 250,
	box_close_time   : 100,
	box_close_length : 160,

	math_elts_model : null,
	type            : null,
	elt_data        : null,
	elt_id          : null,
	before_close    : null
    },

    stateMap  = { $box        : null
		},
    jqueryMap = {},

    setJqueryMap, configModule, initModule, removeBox, getBox,
    setPara, setDOM, setContent, setBottom, checkName,
    saveData,
    onClickDeleteBtn,onClickSaveBtn, onKeyupTitle, onKeyupName;

    
    //---------------------END MODULE SCOPE VARIABLE -----------------------------------

    //--------------------- BEGIN UTILITY METHODS -----------------------------------
    
    saveData = function(){
	var elt_map   = {
	    type    : jqueryMap.$box.find('[name="type"]').val(),
	    title   : jqueryMap.$box.find('[name="title"]').val(),
	    name    : jqueryMap.$box.find('[name="name"]').val(),
	    content : jqueryMap.$box.find('[name="content"]').val()
	},
	    id      = jqueryMap.$box.find('[name="id"]').val();
	
	if(id){
	    var updateDataIo = math.data.admin.getUpdateDataIo();
	    
	    updateDataIo.on('upload', function(){
		removeBox();
		configMap.before_close(configMap.elt_id);
	    });
	    updateDataIo.on('error', function(err){
		console.log(err);
	    });
	    updateDataIo.emit('upload',id,elt_map);
	    
	}else{
	    var createDataIo = math.data.admin.getCreateDataIo();

	    createDataIo.on('create', function(){
		removeBox();
		configMap.before_close(configMap.elt_id);
		configMap.math_elts_model.find_by_name(elt_map.name);
	    });
	    createDataIo.on('error', function(err){
		console.log(err);
	    });
	    createDataIo.emit('create',elt_map);
	}
	
    };

    //--------------------- END UTILITY METHODS -----------------------------------
    
    //---------------------BEGIN DOM METHODS  -----------------------------------
    
    // Begin DOM method /setJqueryMap/
    setJqueryMap = function () {
	var $box       = stateMap.$box;
	jqueryMap = { $box             : $box,
		      $delete_btn      : $box.find('.math-box-delete-btn'),
		      $para            : $box.find('.math-box-para'),
		      $content         : $box.find('.math-box-content'),
		      $bottom          : $box.find('.math-box-bottom')
		    };
    };
    //End DOM method /setJqueryMap

    //Begin DOM method /setDOM/
    setDOM = function(){
	var elt = configMap.elt_data ||{};
	
	elt.name = (elt.name)?elt.name:"";
	elt.title = (elt.title)?elt.title:"";
	elt.type = (elt.type)? elt.type:'def';
	elt.content = (elt.content)? elt.content:"";
	
	setPara(elt);
	setContent(elt);
	setBottom(elt);
    }
    //End DOM method /setDOM/
    
    //Begin DOM method /setPara/
    setPara = function(elt){
	var $title,html,$innerPara,$name;

	html ='<div class="elt-type-container">'
	    +'<span class="elt-dot-type" style="color:'+ math.typeColor(elt.type)+'">●</span>'
	    +'<span class="elt-type-name elt-info-text">'
	    +'<select name="type">'
	    +'<option value="def" >définition</option>'
	    +'<option value="lem">lemme</option>'
	    +'<option value="prop">propriété</option>'
	    +'<option value="th">théorème</option>'
	    +'<option value="cor">corollaire</option>'
	    +'<option value="axiom">axiome</option>'
	    +'<option value="conj">conjecture</option>'
	    +'</select>'
	    +'</span>'
	    +'</div>'
	    +'<div class="elt-title-container math-box-title">'
	    +'<span class="elt-info-text"><input name="title" placeholder="Titre" value="'+elt.title+'"></span>'
	    +'<span class="elt-name elt-info-text"><input name="name" placeholder="Nom (doit être unique, en snakeCase et < 20 caractères)" value="'+elt.name+'"></span>'
	    +'</div>';

	$innerPara = $(html);
	$title = $innerPara.find('[name="title"]');
	$name = $innerPara.find('[name="name"]');
	//on selectionne la bonne valeur
	$innerPara.find('[value="'+elt.type+'"]').attr('selected','selected');
	
	//on ajoute le cotntenu à para
	jqueryMap.$para.empty()
	    .append($innerPara);
	jqueryMap.$name = $name;
	jqueryMap.$title = $title;

	$title.keyup(onKeyupTitle);
	$name.keyup(onKeyupName);
    };
    //End DOM method /setPara/

    //Begin DOM method /setContent/
    setContent = function(elt){
	var html,$innerContent,
	    $content = jqueryMap.$content,
	    completeMentionIo = math.data.admin.getCompletionMentionIo(),
	    completeTagIo = math.data.admin.getCompletionTagIo();

	if(elt.content == "" && elt.parent){
	    elt.content = "@"+elt.parent+'\n';
	}

	html = '<textarea name="content" class="content" placeholder="Contenu de l\'énoncé">'+elt.content+'</textarea><textarea class="copy-content" style="display:none;position:absolute;height:0;border:none;"></textarea>';

	$innerContent = $(html);
	
	$content.append($innerContent);
	// console.log($content.find('.content'));
	// //on copie les événements
	// $content.find('.content').keyup(function(event){
	//     if(event.keyCode == 27 || event.keyCode <41 && event.keyCode >36){
 	// 	$content.find('.copy-content').areacomplete("close");
	//     }else
	// 	$content.find('.copy-content').val($content.find('.content').val()).keydown();
	// });
	// $content.find('.copy-content').on('select',function(){
	//     console.log('ok');
	//     $content.find('.content').val($content.find('.copy-content').val());
	// });

	// $content.find('.content').mentionsInput({
	//     trigger: "@",
	//     source: function(req,res){
	// 	completeMentionIo.on('complete',function(mentions){
	// 	    //mentions = mentions.map(function(mention){return '@'+mention;});
	// 	    res(mentions);
	// 	});	
	// 	completeMentionIo.emit('complete',req);
	//     }
	// });
	$content.find('.content').textcomplete([
	    { // mention strategy
		match: /(^|\s)@(\w*)$/,
		search: function (term, res) {
		    completeMentionIo.on('complete',function(mentions){
			res(mentions);
	 	    });	
		    completeMentionIo.emit('complete',{term : term});
		},
		replace: function (value) {
		    return '$1@' + value + ' ';
		},
		cache: false
	    },
	    { // tag strategy
		match: /(^|\s)#(\w*)$/,
		search: function (term, res) {
		    completeTagIo.on('complete',function(tags){
			res(tags);
	 	    });	
		    completeTagIo.emit('complete',{term : term});
		},
		replace: function (value) {
		    return '$1#' + value + ' ';
		},
		cache: false
	    }
	], { maxCount: 20, debounce: 500 });

	// $content.find('.copy-content').mentionsInput({
	//     trigger: "#",
	//     source: function(req,res){
	// 	completeTagIo.on('complete',function(tags){
	// 	    tags = tags.map(function(tag){return '#'+tag;});
	// 	    res(tags);
	// 	});	
	// 	completeTagIo.emit('complete',req);
	//     }
	// });	


	//on active autosize sur le textarea
	autosize($content.find('.content'));
    };
    //End DOM method /setContent/

    //Begin DOM method /setBottom/
    setBottom = function(elt){
	var html,$innerBottom,$saveBtn,id_input;
	if(elt.id)
	    id_input = '<input type="hidden" name="id" value="'+ elt.id+'"/>';
	else
	    id_input = "";
	html = String()	    
	    +'<div class="math-box-footer">'
	    + id_input 
	    +'<div class="math-admin math-admin-save">'
	    +'<button class="btn sucess math-admin-btn math-admin-save-btn">Enregistrer</button>'
	    +'</div>'
	    +'</div>';
	$innerBottom   = $(html);
	$saveBtn  = $innerBottom.find('.math-admin-save-btn');

	//on vide le contenu de bottom et on le remplie
	jqueryMap.$bottom.empty()
	    .append($innerBottom);
	
	jqueryMap.$bottom.find('.math-admin-save-btn').click(onClickSaveBtn);
    }
    //End DOM method /setBottom/

    //Begin DOM method /checkName/
    checkName = function(){
	var name = jqueryMap.$name,
	    nameVal = name.val();
	var snakeCase  = math.util.snakeCase;
	if(nameVal.length>20 || snakeCase(nameVal) != nameVal ){
	    name.css('border-color','red');
	}else
	    name.css('border-color','black');
    }
    //End DOM method /checkName/
    
    // ------------------------ END DOM METHODS ----------------------------------------------

    // ------------------------ BEGIN EVENT HANDLERS ------------------------------------------

    onKeyupTitle = function(){
	var snakeCase  = math.util.snakeCase;
	jqueryMap.$name.val( snakeCase(jqueryMap.$title.val() ) );
	checkName();
    };

    onKeyupName = function(){
	checkName();
    };
    
    //Begin event handler /onClickSaveBtn/
    onClickSaveBtn = function(){
	saveData();	
    };
    //End event handler /onClickSaveBtn/

    //Begin event handler /onClickDeleteBtn/
    onClickDeleteBtn = function(){
	removeBox();
	configMap.before_close(configMap.elt_id);
	return false;
    };
    //End event handler /onClickDeleteBtn/

    // ------------------------ END EVENT HANDLERS ------------------------------------------
    
    // ------------------------ BEGIN PUBLIC METHODS ------------------------------------------

    
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
    initModule = function( $box ) {
	$box.html( configMap.main_html );
	stateMap.$box = $box;
	setJqueryMap();
	setDOM();

	jqueryMap.$delete_btn.click(onClickDeleteBtn);
	
	return true;
    };
    //End public method /initModule/

    //Begin public method /removeBox/
    removeBox = function(){
	stateMap.$box.remove();
    }
    //End public method /removeBox/

        //Begin public method /getBox/
    getBox = function(){
	return stateMap.$box;
    }
    //End public method /getBox/
    
    //return public Methods
    return {
	configModule       : configModule,
	initModule         : initModule,
	remove             : removeBox,
	get                : getBox
    }

    // ------------------------ END PUBLIC METHODS  ------------------------------------------
}
