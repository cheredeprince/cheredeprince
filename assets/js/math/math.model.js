/*
 * math.model.js
 * modules des models
 */

math.model= ( function () {
    //======================== Elts Model ======================================
    // ----------------------- BEGIN SCOPE VARIABLES --------------------------
    var configMap={
        limit_length : 50
    },
        stateMap= {
            elts_name_map: {},
            idToName: {},
            namesPile: []
        },

        eltProto, makeElt, pushElts,  Elts, initModule,resetElts,selectElt,deselectElt, insertAfter,initWatcher;
    // ---------------------- END SCOPE VARIABLES ------------------------------
    // ---------------------- BEGIN CONSTRUTOR ----------------------------------

    resetElts = function(){
        stateMap.elts_name_map = {};
        stateMap.idToName      = {};
        stateMap.namesPile     = [];
    }

    eltProto = {

    };

    makeElt = function( elt_map ){
        var elt,
            id        = elt_map.id,
            name      = elt_map.name,
            title     = elt_map.title,
            type      = elt_map.type,
            typeDisp  = elt_map.typeDisplay,
            selected  = elt_map.selected,
            createdAt = elt_map.createdAt,
            content   = elt_map.content,
            tags      = elt_map.tags,
            parents   = elt_map.parents,
            children  = elt_map.children;

        if(selected === undefined ){
            selected = true;
        }

        elt           = Object.create( eltProto );
        elt.id        = id;
        elt.name      = name;
        elt.title     = title;
        elt.type      = type;
        elt.typeDisp  = typeDisp;
        elt.selected  = selected;
        elt.createdAt = createdAt;
        elt.content   = content;
        elt.parents   = parents;
        elt.children  = children;

        if( tags ) { elt.tags = tags; }

        return elt;
    },


    pushElts = function( elts_map ){
        var elts = [],key;
        // on construit le ou les elts
        if( Array.isArray(elts_map) ){
            for(key in elts_map){
                elts[key] = makeElt( elts_map[key] )
            }
        }
        else{
            elts = [makeElt( elts_map )];
        }

        // on copie l'état actuel
        var old_elts_name_map = $.extend(true,{},stateMap.elts_name_map),
            old_namesPile     = $.extend(true,[],stateMap.namesPile),
            elts_name_map     = {},
            idToName          = {},
            namesPile         = [],
            idsAdded          = [],
            idsMoved          = [],
            cpt = 0;

        while(cpt< configMap.limit_length && (elts.length !=0 || old_namesPile.length != 0 ) ){
            var elt;
            // tant qu'il reste des elt dans elts
            if(elts.length != 0){
                elt = elts.shift();

                idsAdded.push(elt.id)
            }else if(old_namesPile.length != 0){
                elt = old_elts_name_map[ old_namesPile.shift() ]

            }
            //on n'ajoute pas d'éléments déjà présent
            if(!elts_name_map[elt.name]){
                elts_name_map[elt.name] = elt;
                idToName[elt.id]        = elt.name;
                namesPile.push(elt.name)
            }else{
                idsMoved.push(elt.id)
            }
            cpt ++;
        }

        stateMap.elts_name_map = elts_name_map;
        stateMap.idToName      = idToName;
        stateMap.namesPile     = namesPile;

        return {
            idsAdded   : idsAdded,
            idsRemoved : idsMoved
        };
    };

    //insert un élément après un autre
    insertAfter = function(elt_map, relativeName){
        // on recupère l'état actuel
        var elts_name_map = stateMap.elts_name_map,
            namesPile     = stateMap.namesPile,
            idToName      = stateMap.idToName,
            idsInserted   = [],
            idsMoved      = [],
            elt           = makeElt( elt_map ),
            relativeIndex,
            cpt;

        // si l'elt à inseré existe dejà
        if(elts_name_map[idToName[elt.id]]){
            idsMoved.push(elt.id);
            namesPile.splice(namesPile.indexOf(idToName[elt.id]),1);
        }

        // si le parent existe
        if(relativeName && elts_name_map[relativeName]){
            relativeIndex = namesPile.indexOf(relativeName);

            elts_name_map[elt.name] = elt;
            namesPile.splice(relativeIndex+1,0,elt.name);
            idToName[elt.id] = elt.name;

            idsInserted.push(elt.id);
        }else{
            //on insère l'élement en premier
            elts_name_map[elt.name] = elt;
            namesPile.unshift(elt.name);
            idToName[elt.id] = elt.name;

            idsInserted.push(elt.id);
        }

        if(namesPile.length > configMap.limit_length){
            var last_name = namesPile.pop();

            idsMoved.push(elts_name_map[last_name].id);
            delete elts_name_map[last_name];


        }

        return {
            idsInserted : idsInserted,
            idsRemoved  : idsMoved
        };
    };


    // selectionnne un élément à partir de son nom , renvoie vrai si un changement a eu lieu
    selectElt = function(name){

        if(stateMap.elts_name_map[name]
           && !stateMap.elts_name_map[name].selected){
            stateMap.elts_name_map[name].selected = true;
        }else{
            return false;
        }

        return true;
    };

        // déselectionnne un élément à partir de son nom , renvoie vrai si un changement a eu lieu
    deselectElt = function(name){

        if(stateMap.elts_name_map[name]
           && stateMap.elts_name_map[name].selected){
            stateMap.elts_name_map[name].selected = false;
        }else{
            return false;
        }

        return true;
    };

        //----------------------- END CONSTRUCTOR -----------------------------------
        //----------------------- BEGIN PUBLIC MODEL --------------------------------
        Elts = (function(){
            var get_elts, get_elt_names, get_selected_elts, get_by_name,
                get_by_id,get_before_id, select_by_name, deselect_by_name, update_elt,
                search, find_by_name, is_loaded, load, remove_by_name ,reset;

            // récupére les éléments dans l'ordre
            get_elts = function(){
                var elts = [], key;
                for(key = 0; key < stateMap.namesPile.length; key++){
                    elts.push($.extend({},stateMap.elts_name_map[ stateMap.namesPile[key] ]))
                }
                return elts;
            };


            // récupére les noms des  éléments dans l'ordre
            get_elt_names = function(){

                return $.extend([],stateMap.namesPile);
            };


            // récupére les éléments sélectionné dans l'ordre
            get_selected_elts = function(){
                var selected_elts = [], key;
                for(key = 0; key < stateMap.namesPile.length; key++){
                    //si l'élement est séléctionné
                    if(stateMap.elts_name_map[ stateMap.namesPile[key] ].selected)
                        selected_elts.push($.extend({},stateMap.elts_name_map[ stateMap.namesPile[key] ]));
                }
                return selected_elts;
            };

            get_by_name = function(name){
                var elt;

                if(stateMap.elts_name_map[name])
                    elt = $.extend({}, stateMap.elts_name_map[name])
                else
                    return false;

                return elt;
            };

            get_before_id = function(id){
                var elt,index;

                if(stateMap.elts_name_map[ stateMap.idToName[id] ]){
                    index = stateMap.namesPile
                        .indexOf(stateMap.idToName[id]);

                    if(index !==0)
                        elt = $.extend({}, stateMap.elts_name_map[stateMap.namesPile[index-1]]);
                    else
                        return false;
                }
                else
                    return false;

                return elt;
            };

            get_by_id = function(id){
                var elt;

                if( stateMap.elts_name_map[ stateMap.idToName[ id ] ])
                    elt = $.extend({}, stateMap.elts_name_map[ stateMap.idToName[ id ] ]);
                else
                    return false;

                return elt;
            };

            select_by_name = function(name){
                if(selectElt(name)){
                    var updateInfo = {
                        idsSelection: {}
                    };
                    updateInfo.idsSelection[Elts.get_by_name(name).id] = true;
                    $.gevent.publish('math-elts-update',[updateInfo])
                    $.gevent.publish('math-elts-changes', [Elts.get_elts()])
                }else{
                    return false;
                }


            };

            deselect_by_name = function(name){
                if(deselectElt(name)){
                    var updateInfo = {
                        idsSelection: {}
                    };
                    updateInfo.idsSelection[Elts.get_by_name(name).id] = false;
                    $.gevent.publish('math-elts-update',[updateInfo]);
                    $.gevent.publish('math-elts-changes', [Elts.get_elts()]);
                }else{
                    return false;
                }
                return true;
            };

            remove_by_name= function(name) {
                var elt = stateMap.elts_name_map[name],
                    indexPile,
                    id =(elt)?elt.id:'';

                if(elt){
                    delete stateMap.elts_name_map[name]
                    indexPile = stateMap.namesPile.indexOf(name)
                    stateMap.namesPile = stateMap.namesPile.slice(0, indexPile).concat(stateMap.namesPile.slice(indexPile+1,stateMap.namesPile.length));

                    $.gevent.publish('math-elts-update',[{idsRemoved: [id]}]);
                    $.gevent.publish('math-elts-changes', [Elts.get_elts()]);
                }else{
                    return false;
                }

                return true;
            };

            // met à jour le contenu de elt.name en le placant apres relatibe
            update_elt = function(elt,relativeName){
                var updateInfo;
                
                updateInfo = insertAfter(elt,relativeName);
                selectElt(elt.name);
                console.log(updateInfo);
                $.gevent.publish('math-elts-update',[updateInfo]);
                $.gevent.publish('math-elts-changes',[Elts.get_elts()]);
            };
            
            search = function(query){
                var SearchIo = math.data.getSearchIo();

                SearchIo.on('search',function(data){
                    var updateInfo = pushElts(data);

                    $.gevent.publish('math-elts-update',[updateInfo]);
                    $.gevent.publish('math-elts-changes', [Elts.get_elts()]);
                });

                SearchIo.on('error',console.error);

                SearchIo.emit('search',{query : query});
            };

            find_by_name = function(name, relativeName,event){

                var FindByNameIo = math.data.getFindByNameIo(),
                    eventInfo = event;

                FindByNameIo.on('find',function(elt){

                    var name = elt.name,
                        updateInfo;

                    updateInfo = insertAfter(elt,relativeName);
                    selectElt(name);

                    $.gevent.publish('math-elts-update',[updateInfo,eventInfo]);
                    $.gevent.publish('math-elts-changes',[Elts.get_elts()]);
                });

                FindByNameIo.on('error',function(err){console.log(err);});


                FindByNameIo.emit('find',{name : name});
            };

            // vérifie si un contenu est chargé dans le model
            is_loaded = function(names_selected_map){
                var is_loaded, cpt = 0, names = Object.keys(names_selected_map), is_name_selected;

                is_loaded = names.length == stateMap.namesPile.length;

                while(is_loaded && cpt< names.length){
                    is_name_selected = names_selected_map[names[cpt]] == 1;

                    is_loaded = names[cpt] == stateMap.namesPile[cpt]
                        && is_name_selected == stateMap.elts_name_map[ stateMap.namesPile[cpt] ].selected;
                    cpt ++;
                }

                return is_loaded;
            };

            // remplace les éléments actuels par ceux proposés avec la bonne sélection à moins qu'il s soient tous bons
            load = function(names_selected_map){
                var names = Object.keys(names_selected_map);
                var loadNamesIo = math.data.getLoadNamesIo();

                loadNamesIo.on('error', console.error);

                loadNamesIo.on('timeout',function(){
                    $.gevent.publish('math-elts-refresh')
                    $.gevent.publish('math-elts-changes',[Elts.get_elts()])
                });

                loadNamesIo.on('load',function(elts){

                    resetElts();
                    var key;
                    // on applique la selection
                    for(key = 0; key< elts.length; key++){
                        elts[key].selected = names_selected_map[elts[key].name] == 1;
                    }

                    pushElts(elts);

                    $.gevent.publish('math-elts-refresh');
                    $.gevent.publish('math-elts-changes',[Elts.get_elts()]);
                });

                loadNamesIo.emit('load', {names : names});

            };

            reset = function(){

                resetElts();

                $.gevent.publish('math-elts-refresh');
                $.gevent.publish('math-elts-changes', [Elts.get_elts()]);
                return true;
            };

            return{
                get_elts          : get_elts,
                get_elt_names     : get_elt_names,
                get_selected_elts : get_selected_elts,
                get_by_name       : get_by_name,
                get_by_id         : get_by_id,
                get_before_id     : get_before_id,
                select_by_name    : select_by_name,
                deselect_by_name  : deselect_by_name,
                remove_by_name    : remove_by_name,
                update_elt        : update_elt,
                search            : search,
                find_by_name      : find_by_name,
                is_loaded         : is_loaded,
                load              : load,
                reset             : reset
            };
        }());
    //----------------------- END PUBLIC MODEL ----------------------------------

    //----------------------- BEGIN EVENTS -------------------------------

    initWatcher = function(){
        var watchIo = math.data.getWatchIo();
        // la souscription est faite par math.model.graph
        watchIo.on('elt',function(obj){
            var old_elt = Elts.get_by_id(obj.id);
            if(old_elt){
                var elt_before = Elts.get_before_id(obj.id);
                if(elt_before) //il y a un élément avant
                    Elts.update_elt(obj.data,elt_before.name);
                else //c'est le premier de la liste
                    Elts.find_by_name(obj.data.name);
            }
        });

        watchIo.init('elt');
    };

    //----------------------- END EVENTS ---------------------------------

    //----------------------- BEGIN PUBLIC METHOD -------------------------------

    initModule = function(){
        initWatcher();
        math.model.Graph.load();
    };

    return {
        Elts       : Elts,
        initModule : initModule
    };
    //----------------------- END PUBLIC METHOD ---------------------------------
    }());
