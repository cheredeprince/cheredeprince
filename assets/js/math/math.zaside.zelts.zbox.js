math.aside.elts.box = function($box,mini){
    var
    configMap = {
        main_html: String()
            +'<div class="math-box math-elt" itemscope itemtype="http://schema.org/CreativeWork">'
            +'<div class="object">'

            +'<div class="math-box-para">'
            +'</div>'

            +'<div class="math-box-delete-btn" title="supprimer cet élément de la liste">'
            +'<svg class="math-box-icon">'
            +'<use xlink:href="#math-delete-icon"></use>'
            +'</svg>'
            +'</div>'

            +'<div class="math-admin-edit-btn math-admin" title="éditer cet élément">'
            +'<svg class="math-box-icon">'
            +'<use xlink:href="#math-edit-icon"></use>'
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

            elt_id          : true,
            math_elts_model : true,
            show_elt        : true,
            normallight_elt : true,
            highlight_elt   : true,
            edit_elt        : true,
            add_child       : true
        },

        box_open_time    : 250,
        box_close_time   : 100,
        box_close_length : 160,
        elt_id          : null,
        math_elts_model : null,
        show_elt        : null,
        normallight_elt : null,
        highlight_elt   : null,
        edit_elt        : null,
        add_child       : null
    },

    stateMap  = { $box        : null,
                  open        : null
                },
    jqueryMap = {},

    setJqueryMap, configModule, initModule, removeBox,deleteBox, getBox,
    setPara, setClosedBottom, setDOM, setContent, setOpenedBottom,
    initFamily,
    onClickBox, openOrClose, onClickParentsBtn, onClickChildrenBtn, onClickEditBtn,onClickAddChildBtn,
    onClickDeleteBtn, onClickFamilyLink, onClickFamilyMiniBtn,onClickTitle,onHoverInTitles,onHoverOutTitles;


    //---------------------END MODULE SCOPE VARIABLE -----------------------------------

    //--------------------- BEGIN UTILITY METHODS -----------------------------------

    //--------------------- END UTILITY METHODS -----------------------------------

    //---------------------BEGIN DOM METHODS  -----------------------------------

    // Begin DOM method /setJqueryMap/
    setJqueryMap = function () {
        var $box       = stateMap.$box;
        jqueryMap = { $box             : $box,
                      $delete_btn      : $box.find('.math-box-delete-btn'),
                      $para            : $box.find('.math-box-para'),
                      $content         : $box.find('.math-box-content'),
                      $bottom          : $box.find('.math-box-bottom'),
                      $edit_btn        : $box.find('.math-admin-edit-btn')
                    };
    };
    //End DOM method /setJqueryMap

    //Begin DOM method /setDOM/
    setDOM = function(){
        var elt = configMap.math_elts_model.get_by_id(configMap.elt_id);

        jqueryMap.$box.attr('id',elt.name);
        setPara(elt);
        setContent(elt);
        if(!elt.selected){
            setClosedBottom(elt);
        }else{
            setOpenedBottom(elt);
        }
    }
    //End DOM method /setDOM/

    //Begin DOM method /setPara/
    setPara = function(elt){
        var $title,html,$innerPara;

        html ='<div class="elt-type-container">'
            +'<span class="elt-dot-type" style="color:'+ math.typeColor(elt.type)+'">●</span>'
            +'<span class="elt-type-name elt-info-text">'+elt.typeDisp+'</span>'
            +'</div>'
            +'<div class="elt-title-container math-box-title" data-name="'+elt.name+'">'
            +'<span class="elt-title" itemprop="name">'+elt.title+'</span>'
            +'<span class="elt-name elt-info-text">'+elt.name+'</span>'
            +'</div>';

        $innerPara = $(html);

        //on ajoute le cotntenu à para
        jqueryMap.$para.empty()
            .append($innerPara)

        $title = jqueryMap.$para.find('.math-box-title');
        //on ajoute le titre à jqueryMap
        jqueryMap.$title = $title;
    }
    //End DOM method /setPara/

    //Begin DOM method /setContent/
    setContent = function(elt){
        var html,$innerContent, needXyJax, MathQueue,
            $content = jqueryMap.$content,
            is_empty = $content.children().length == 0,
            initial_height = $content.height(),
            auto_height;
        html = elt.content;
        needXyJax = html.search('\\xymatrix') != -1;
        jqueryMap.$content.empty()
            .attr("id",elt.name+'Content');

        //si on a besoin de l'extension xyjax on la charge
        if(needXyJax)
            MathJax.Hub.Queue(["Require", MathJax.Ajax, "/js/other/xyjax.min.js"]);

        if(elt.selected){
            $innerContent = $(html);
            $content.append($innerContent);

        }else{
            var reduce_html = math.utilb.truncate(html,160);

            $innerContent = $(reduce_html);
            $content.append($innerContent);
        }

        //si le contenu n'était pas vide, on fait un petit effet
        if(!is_empty){
            auto_height = $content.css('height', 'auto').height();
            $content.height(initial_height);

            $content.animate({height: auto_height},function(){
                $content.css('height','auto');
                //On lance mathJax
                MathJax.Hub.Queue(["Typeset",MathJax.Hub,elt.name+'Content']);
            });
        }else{
            setTimeout(function(){
                MathJax.Hub.Queue(["Typeset",MathJax.Hub,elt.name+'Content']);
            },100);
        }
    };
    //End DOM method /setContent/

    //Begin DOM method /setClosedBottom/
    setClosedBottom = function(elt){
        var $parentsmini_btn, $childrenmini_btn, $addchild_btn,html,$innerBottom;
        html ='<div class="math-box-footer">'
              +'<div class="math-admin">'
                +'<div class="elt-parents-info-mini math-box-icon-mini math-box-addchild-btn" title="ajouter un enfant à cet élément">'
                  +'<svg class="math-box-icon">'
                    +'<use xlink:href="#math-ajout-icon"></use>'
                  +'</svg>'
                +'</div>'
              +'</div>'
            +'<div class="elt-parents-info-mini math-box-icon-mini math-box-parentsmini-btn">'
            +'<svg class="math-box-icon">'
            +'<use xlink:href="#math-parents-icon"></use>'
            +'</svg>'
            +'<span class="math-box-number elt-info-text">'
            +elt.parents.length
            +'</span>'
            +'</div>'
            +'<div class="elt-parents-info-mini math-box-icon-mini math-box-childrenmini-btn">'
            +'<svg class="math-box-icon">'
            +'<use xlink:href="#math-enfants-icon"></use>'
            +'</svg>'
            +'<span class="math-box-number elt-info-text">'
            +elt.children.length
            +'</span>'
            +'</div>'
            +'</div>';
        $innerBottom      = $(html);
        $parentsmini_btn  = $innerBottom.find('.math-box-parentsmini-btn');
        $childrenmini_btn = $innerBottom.find('.math-box-childrenmini-btn');
        $addchild_btn     = $innerBottom.find('.math-box-addchild-btn');

        //on vide le contenu de bottom et on le remplie
        jqueryMap.$bottom.empty()
            .append($innerBottom);
        //on ajoute le événement

        $parentsmini_btn.click('parents',onClickFamilyMiniBtn);
        $childrenmini_btn.click('children',onClickFamilyMiniBtn);
        $addchild_btn.click(onClickAddChildBtn);
    }
    //End DOM method /setClosedBottom/

    //Begin DOM method /setOpenedBottom/
    setOpenedBottom = function(elt){
        var $parents_btn, $children_btn, $addchild_btn,$family,html, tags_html,$innerBottom;

        if(elt.tags){
            tags_html = '<ul class="elt-tags elt-info-text inline-list">';
            var cpt;
            for(cpt = 0; cpt<elt.tags.length;cpt++){
                tags_html += '<li class="math-link-tag" data-name="'+elt.tags[cpt]+'">'+elt.tags[cpt]+'</li>';
            }
            tags_html += '</ul>'

        }else{
            tags_html = '';
        }

        html = String()
            +'<div class="math-box-related-info">'
            + tags_html

            +'<div class="elt-family-info math-box-family">'
            +'<input type="radio" id="math-box-family-check-p-'+elt.name+'" name="radio-'+elt.name+'" class="math-box-family-check-p" role="button" checked />'
            +'<label for="math-box-family-check-p-'+elt.name+'" class="elt-parents-info math-box-family-label">'
            +'<span class="math-box-number elt-info-text">'
                    + elt.parents.length + ' '
                  +'</span>'
                  +'<span class="elt-family-name  elt-info-text math-box-family-parents-label">'
                    +'Parents'
                  +'</span>'
            +'</label>'
            +'<input type="radio" id="math-box-family-check-c-'+elt.name+'" name="radio-'+elt.name+'" class="math-box-family-check-c" role="button" />'
            +'<label for="math-box-family-check-c-'+elt.name+'" class="elt-children-info math-box-family-label" >'
                  +'<span class="math-box-number elt-info-text">'
                    + elt.children.length + ' '
                  +'</span>'
                  +'<span class="elt-family-name  elt-info-text math-box-family-children-label">'
                    +'Enfants'
                  +'</span>'
            +'</label>'
            +'</div>'
            +'<p class="elt-date-info elt-info-text">'
              + math.utilb.simpleDate( new Date(elt.createdAt) )
            +'</p>'
          +'</div>'

            +'<div class="math-box-footer">'
              +'<div class="math-admin">'
                +'<div class="elt-parents-info-mini math-box-icon-mini math-box-addchild-btn" title="ajouter un enfant à cet élément">'
                  +'<svg class="math-box-icon">'
                    +'<use xlink:href="#math-ajout-icon"></use>'
                  +'</svg>'
                +'</div>'
              +'</div>'
            +'</div>';
        $innerBottom   = $(html);
        $parents_btn   = $innerBottom.find('.elt-parents-info');
        $children_btn  = $innerBottom.find('.elt-children-info');
        $family        = $innerBottom.find('.math-box-family');
        $addchild_btn  = $innerBottom.find('.math-box-addchild-btn');

        //on remplit la famille
        jqueryMap.$family = $family;
        initFamily();
        //on vide le contenu de bottom et on le remplie
        jqueryMap.$bottom.empty()
            .append($innerBottom);
        //on ajoute les événements

        $children_btn.click(onClickChildrenBtn);
        $parents_btn.click(onClickParentsBtn);
        $addchild_btn.click(onClickAddChildBtn);
    }
    //End DOM method /setOpenedBottom/

    //Begin DOM method /initFamily/
    initFamily = function(){

        var elt     = configMap.math_elts_model.get_by_id(configMap.elt_id),
            $ul1,
            $ul2,
            $family = jqueryMap.$family,
            $parentsInfo = jqueryMap.$box.find('.elt-parents-info'),
            $childrenInfo = jqueryMap.$box.find('.elt-children-info'),
            cpt,
            eltTemp;

        eltTemp = function(eltMini){
            return  String()
                +'<li class="math-elt-mini math-elt math-box-family-link"'
                +' data-name="'+eltMini.name+'" data-relative="'+elt.name+'">'
                  +'<div class="elt-title-container" data-name="'+eltMini.name+'">'
                    +'<span class="elt-dot-type" style="color:'+math.typeColor(eltMini.type)+'">●</span>'
                    +'<span class="elt-title">'+eltMini.title+'</span>'
                    +'<span class="elt-name elt-info-text">'+eltMini.name+'</span>'
                  +'</div>'
                +'</li>';
        }

        $ul1 = $('<ul>')
            .addClass("math-elt-list-mini math-box-family-list math-box-family-children");
        $ul2 = $('<ul>')
            .addClass("math-elt-list-mini math-box-family-list math-box-family-parents");


        for(cpt = 0; cpt<elt.children.length;cpt++){
            var li_html = eltTemp(elt.children[cpt]);
            $ul1.append($(li_html));
        }
        $family.append($ul1);

        for(cpt = 0; cpt<elt.parents.length;cpt++){
            var li_html = eltTemp(elt.parents[cpt]);
            $ul2.append($(li_html));
        }
        $family.append($ul2);

        jqueryMap.$box.find('.elt-title-container').hover(onHoverInTitles,onHoverOutTitles);
        $family.find('.math-box-family-link').click(onClickFamilyLink);
};
    //End DOM method /initFamily/
    // ------------------------ END DOM METHODS ----------------------------------------------

    // ------------------------ BEGIN EVENT HANDLERS ------------------------------------------

    // ------------------------ END EVENT HANDLERS ------------------------------------------

    onClickEditBtn = function(event){
        configMap.edit_elt(configMap.elt_id);
        return false;
    };

    onClickAddChildBtn = function(event){
        configMap.add_child(configMap.elt_id);
        return false;
    };

    //Begin public method /openOrClose/
    openOrClose = function(){
        var elt = configMap.math_elts_model.get_by_id(configMap.elt_id);
        if(!stateMap.open == elt.selected){
            stateMap.open = elt.selected;

            setContent(elt);
            if(stateMap.open){
                setOpenedBottom(elt);
            }else{
                setClosedBottom(elt);
            }
        }
    };
    //End public method /openOrClose/

    //Begin event handler /onClickBox/
    onClickBox = function(event){
        if($(event.target).is(jqueryMap.$box)){
            var elt = configMap.math_elts_model.get_by_id(configMap.elt_id);
            if(stateMap.open)
                configMap.math_elts_model.deselect_by_name(elt.name);
            else
                configMap.math_elts_model.select_by_name(elt.name);
        }
    };
    //End event handler /onClickBox/

    onClickFamilyMiniBtn = function( event ){
        if(event.data){
            stateMap.family_show = event.data;
        }
        return true;
    }

    //Begin event handler /onClickDeleteBtn/
    onClickDeleteBtn = function(){
        var elt = configMap.math_elts_model.get_by_id(configMap.elt_id);
        configMap.math_elts_model.remove_by_name(elt.name);

        return false;
    }
    //End event handler /onClickDeleteBtn/

    //Begin event handler /onClickFamilyLink/
    onClickFamilyLink = function( event ){

        var $target = $(event.currentTarget),
            targetName = $target.attr("data-name"),
            relativeName = $target.attr("data-relative");

        configMap.math_elts_model.find_by_name(targetName, relativeName)

        return false;
    }
    //End event handler /onClickFamilyLink/

    onClickTitle = function(){
        var elt = configMap.math_elts_model.get_by_id(configMap.elt_id);
        configMap.show_elt(elt.name);

        return false;
    };

    onHoverInTitles = function(event){

        var name = $(event.currentTarget).attr('data-name');
        configMap.highlight_elt(name);
        return false;
    };

    onHoverOutTitles = function(event){
        var name = $(event.currentTarget).attr('data-name');
        configMap.normallight_elt(name);
        return false;
    };

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
    initModule = function( $box,cb ) {
        $box.html( configMap.main_html );
        stateMap.$box = $box;
        setJqueryMap();
        setDOM();

        stateMap.open = configMap.math_elts_model.get_by_id(configMap.elt_id).selected;

        $box.click(onClickBox);

        jqueryMap.$title.click(onClickTitle);
        $box.find('.elt-title-container').hover(onHoverInTitles,onHoverOutTitles);
        jqueryMap.$delete_btn.click(onClickDeleteBtn);
        jqueryMap.$edit_btn.click(onClickEditBtn);

        if(cb)
            return cb();
        else
            return true;
    };
    //End public method /initModule/

    //Begin public method /removeBox/
    // Supprime doucement la box
    removeBox = function(cb){
        stateMap.$box.slideUp(function(){
            stateMap.$box.remove();

            if (cb)
                cb();
        });
    };
    //End public method /removeBox/

    //Begin public method /removeBox/
    // Supprime d'un seul coup la box
    deleteBox = function(){
            stateMap.$box.remove();
    };
    //End public method /removeBox/

        //Begin public method /getBox/
    getBox = function(){
        return stateMap.$box;
    };
    //End public method /getBox/

    //return public Methods
    return {
        configModule       : configModule,
        initModule         : initModule,
        openOrClose        : openOrClose,
        remove             : removeBox,
        get                : getBox
    }

    // ------------------------ END PUBLIC METHODS  ------------------------------------------
}
