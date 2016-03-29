/*
 * math.aside.elts.js
 * module du panneau des elts
 */

math.aside.elts = (function () {
    //---------------------BEGIN MODULE SCOPE VARIABLE -----------------------------------
    var
    configMap = {
	main_html: String()
	    +'<div class="math-admin math-admin-new">'
	    +'<button class="btn alt math-admin-btn math-admin-new-btn">Créer</button>'
	    +'</div>'
	
	    +'<ul class="math-aside-elts-list">'
	    +'</ul>'
	,
	settable_map: {
	    math_elts_model : true,
	    show_elt        : true,
	    scrollTo        : true,
	    normallight_elt : true,
	    highlight_elt   : true
	},
	
	math_elts_model : null,
	show_elt        : null,
	scrollTo        : null,
	normallight_elt : null,
	highlight_elt   : null
    },
    
    stateMap  = { $panel           : null,
		  $refresh_btn     : null,
		  boxsMap          : {},
		  is_administrate  : false,
		  adminBox_cpt     : 0,
		  adminBox_id      : 0
		},
    jqueryMap = {},

    setJqueryMap, configModule, initModule,
    makeBoxTemplate,addEltsToPanel, insertEltsToPanel, removeEltsToPanel,
    insertNewBox, deleteAdminBox, editBox, addNewChild,
    onClickRefreshBtn, onEltsUpdate, onEltsRefresh,clearPanel, onClickNewBtn;

    //---------------------END MODULE SCOPE VARIABLE -----------------------------------

    //--------------------- BEGIN UTILITY METHODS -----------------------------------

    deleteAdminBox = function(id){
	
	var edition_box = stateMap.boxsMap[id],
	    edited_box = edition_box.edited_box;

	if(edited_box && edited_box.edited){
	    //si on a une boite d'édition, on la déactive et on montre l'object édité
	    edited_box.edited = false;
	    edited_box.get().show();
	}
	delete stateMap.boxsMap['admin_' +id];
	stateMap.adminBox_cpt --;
	
	if(stateMap.adminBox_cpt == 0){
	    stateMap.is_administrate = false;
	}
    };

    editBox = function(id){
	var edited_box  = stateMap.boxsMap[id];
	
	var getData = math.data.admin.getGetDataIo(); 

	getData.on('get',function(elt_data){
	    edited_box.get().hide();
	    edited_box.edited = true;
	    insertNewBox(elt_data,edited_box);
	});

	getData.emit('get',id);
    };
    
    addNewChild = function(id){
	var parent_box = stateMap.boxsMap[id],
	    parent_elt = configMap.math_elts_model.get_by_id(id),
	    elt_data   = {parent: parent_elt.name};
	insertNewBox(elt_data,parent_box);
    };

    //--------------------- END UTILITY METHODS -----------------------------------

    //---------------------BEGIN DOM METHODS  -----------------------------------
    // Begin DOM method /setJqueryMap/
    setJqueryMap = function () {
	var $panel       = stateMap.$panel,
	    $refresh_btn = stateMap.$refresh_btn;
	jqueryMap = { $panel           : $panel,
		      $list            : $panel.find('.math-aside-elts-list'),
		      $refresh_btn     : $refresh_btn,
		      $newBtn          : $panel.find('.math-admin-new-btn')
		    };
    };
    //End DOM method /setJqueryMap

    //Begin DOM method /addEltsToPanel/
    addEltsToPanel = function(idsAdded){
	var cpt,lastAdded, is_edited;
	for(cpt = 0;cpt<idsAdded.length;cpt++){
	    is_edited = stateMap.boxsMap[idsAdded[cpt]] && stateMap.boxsMap[idsAdded[cpt]].is_edited;
	    if(!is_edited){
		var li = $('<li>'),
		    box = math.aside.elts.box();

	box.configModule({
		    math_elts_model : configMap.math_elts_model,
		    elt_id          : idsAdded[cpt],
		    show_elt        : configMap.show_elt,
		    highlight_elt   : configMap.highlight_elt,
		    normallight_elt : configMap.normallight_elt,
	            edit_elt        : editBox,
		    add_child       : addNewChild
		});
		// on ajoute li en premier pour avoir un rendu;
		if(cpt == 0){
		    jqueryMap.$list.prepend(li);
		}else{
		    lastAdded.after(li);
		}
		lastAdded = li;

		box.initModule(li);
		stateMap.boxsMap[idsAdded[cpt]] = box;	    
	    }

	}	
    }
    //End DOM method /addEltsToPanel/

    //Begin DOM method /insertEltsToPanel/
    insertEltsToPanel = function(idsInserted){
	var cpt,li,box,before_elt,$before,is_edited,
	    firstInsert = configMap.math_elts_model.get_by_id(idsInserted[0]) || {name:''};
	for(cpt = 0;cpt<idsInserted.length;cpt++){
	    is_edited = stateMap.boxsMap[idsInserted[cpt]] && stateMap.boxsMap[idsInserted[cpt]].is_edited;
	    if(!is_edited){
		li = $('<li>');
		box = math.aside.elts.box(),
		before_elt = configMap.math_elts_model.get_before_id(idsInserted[cpt]);
		box.configModule({
		    math_elts_model : configMap.math_elts_model,
		    elt_id          : idsInserted[cpt],
		    show_elt        : configMap.show_elt,
		    highlight_elt   : configMap.highlight_elt,
		    normallight_elt : configMap.normallight_elt,
		    edit_elt        : editBox,
		    add_child       : addNewChild
		});
		// on ajoute li en premier pour avoir un rendu;
		//si on a un elt avant, on insert après
		if(before_elt){
		    $before = stateMap.boxsMap[before_elt.id].get();
		    $before.after(li);
		}else{
		    //sinon on insert au début de la liste
		    jqueryMap.$list.prepend(li);
		}
		box.initModule(li,function(){
		    console.log('ou');
		    configMap.scrollTo(firstInsert.name);
		    return true;
		});
		stateMap.boxsMap[idsInserted[cpt]] = box;    
	    }
	}
	//       configMap.show_elt(firstInsert.name);
    };
    //End DOM method /addEltsToPanel/
    
    //Begin DOM method /removeEltsToPanel/
    removeEltsToPanel = function(idsRemoved,cb){
	var cpt,is_edited,k;
	k=0;
	var next = function(){
		    k++;
		    //si on a fini supprimer tous les éléments
		    if(k == idsRemoved.length)
			cb();
	};

	for(cpt = 0;cpt<idsRemoved.length;cpt++){
	    is_edited = stateMap.boxsMap[idsRemoved[cpt]] && stateMap.boxsMap[idsRemoved[cpt]].is_edited;
	    if(!is_edited){
		stateMap.boxsMap[idsRemoved[cpt]].remove(function(){
		    next();
		    delete stateMap.boxsMap[idsRemoved[cpt]];
		});
	    }else
		next();
	}
	
	if(idsRemoved.length == 0)
	    cb();
    };
    //End DOM method /removeEltsToPanel/

    //Begin DOM method /cleanPanel/
    clearPanel = function(){

	//on détache les boites d'administration'
	var $admin_boxs = jqueryMap.$panel.find('.math-admin-box').detach(),
	    box; 
	
	for(box in stateMap.boxsMap){
	    if(box.type == 'admin'){
		box = undefined;
	    }
	}

	jqueryMap.$list.empty();
	//on les ratache
	jqueryMap.$list.append($admin_boxs);
    };
    //End DOM method /cleanPanel/
    
    //Begin DOM method /addNewBox/
    insertNewBox = function(elt_data,edited_box){
	var li,box,$before, elt_id;

	li = $('<li>').addClass('math-admin-box');
	elt_id = 'admin_'+ stateMap.adminBox_id;
	box = math.aside.elts.admin(),
	box.type = 'admin'
	box.configModule({
	    before_close    : deleteAdminBox,
	    math_elts_model : configMap.math_elts_model,
	    elt_data        : elt_data,
	    elt_id          : elt_id
	});
	// on ajoute li en premier pour avoir un rendu;
	//si on a un elt avant, on insert après
	if(edited_box){
	    $before = edited_box.get();
	    $before.after(li);
	    edited_box.edited = true;
	    box.edited_box = edited_box;
	}else{
	    //sinon on insert au début de la liste
	    jqueryMap.$list.prepend(li);
	}
	
	stateMap.boxsMap['admin_'+stateMap.adminBox_id] = box;    
	stateMap.is_administrate = true;
	box.initModule(li);
	stateMap.adminBox_cpt++;
	stateMap.adminBox_id ++;
    };
    //End DOM method /addNewBox/

    // ------------------------ END DOM METHODS ----------------------------------------------
    // ------------------------ BEGIN EVENT HANDLERS ------------------------------------------
    onClickRefreshBtn = function( event ){
	configMap.math_elts_model.reset();
	return false;
    };

    onClickNewBtn = function(){
	insertNewBox({});
    };

    onEltsUpdate = function(event, updateInfo, eventInfo){

	var onlySelection = true;
	console.log(updateInfo);
	// fonction à lancer une fois que tous les éléments à supprimer le sont
	var next = function(){
	    console.log('ok')
	    if(updateInfo.idsAdded){
		onlySelection = false;
		addEltsToPanel(updateInfo.idsAdded);
	    }
	    
	    if(updateInfo.idsInserted){
		onlySelection = false;
		insertEltsToPanel(updateInfo.idsInserted);
	    }
	    
	    if(updateInfo.idsSelection){
		var id;
		for(id in updateInfo.idsSelection){
		    stateMap.boxsMap[id].openOrClose();
		}
	    }
	    
	    if((!eventInfo || !eventInfo.source == 'graph') && !onlySelection)
		configMap.show_elt(configMap.math_elts_model.get_elt_names());
	};
	// on supprime ce qu'il y a supprimé
	if(updateInfo.idsRemoved){
	    onlySelection = false;
	    removeEltsToPanel(updateInfo.idsRemoved,next);
	}else 
	    next();
    };

    onEltsRefresh = function(event){
	var elts = configMap.math_elts_model.get_elts(),
	    ids = [],
	    key;
	
	for(key=0;key<elts.length;key++){
	    ids.push(elts[key].id);
	}
	
	clearPanel();
	addEltsToPanel(ids);
    };

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

    configModule = function( input_map ){
	math.util.setConfigMap({
	    input_map    : input_map,
	    settable_map : configMap.settable_map,
	    config_map   : configMap
	})
	return true;
    }
    //End public method /configModule/

    //Begin public method /initModule/
    initModule = function( $panel, $refresh_btn ) {
	$panel.html( configMap.main_html );
	stateMap.$panel = $panel;
	stateMap.$refresh_btn = $refresh_btn;
	setJqueryMap();
	
	jqueryMap.$refresh_btn.click(onClickRefreshBtn);
	jqueryMap.$newBtn.click(onClickNewBtn);

	$.gevent.subscribe($panel,'math-elts-update',onEltsUpdate);
	$.gevent.subscribe($panel,'math-elts-refresh',onEltsRefresh);
	return true;
    };
    //End public method /initModule/
    
    //return public Methods
    return {
	configModule       : configModule,
	initModule         : initModule
    }

    // ------------------------ END PUBLIC METHODS  ------------------------------------------
}())
