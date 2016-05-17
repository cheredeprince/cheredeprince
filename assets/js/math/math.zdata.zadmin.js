/*
 * data admin module
 */

math.data.admin = (function(){

    var
    configMap = {
        loadingTime: 2000
    },

    stateMap = {
        completionsTag: {},
        completionsMention: {}
    },

    getDataIo,getCreateDataIo,getUpdateDataIo,getCompletionMentionIo,getCompletionTagIo;


    getDataIo = function(){
        var on, emit, callback_map = {};

        on = function(event, callback){
            callback_map[event] = callback;
        };

        emit = function(event,id){
            if(event == 'get'){
                io.socket.get('/math/admin_data/'+encodeURI(id),function(res,jwres){
                    if(res && ! res.error){
                        callback_map.get(res);
                    }else{
                        console.error('Data is undefined '+ jwres+'\nError :'+res.error);
                        if(callback_map.error)
                            callback_map.error();
                    }
                });
            }
        };

        return {
            on   : on,
            emit : emit
        };
    };

    getCreateDataIo = function(){
        var on, emit, callback_map = {};

        on = function(event, callback){
            callback_map[event] = callback;
        };

        emit = function(event,elt_map){
            if(event == 'create'){
                var values = {};
                io.socket.get('/csrfToken',function(data){
                    values._csrf=data._csrf;
                    values.elt = elt_map;
                    io.socket.post('/math/admin_create/',values,function(res,jwres){
                        console.log(res,jwres);
                        if(res && !res.error){
                            if(callback_map.create){
                                callback_map.create(res);
                            }
                        }else{
                            console.error('Data is undefined '+ jwres+'\nError :'+res.error);
                            var invalidAttributes = Object.keys(res.invalidAttributes);

                            if(callback_map.error)
                                callback_map.error(invalidAttributes);
                        }
                    });
                });
            }
        };

        return {
            on   : on,
            emit : emit
        };

    };

    getUpdateDataIo = function(){
        var on, emit, callback_map = {};

        on = function(event, callback){
            callback_map[event] = callback;
        };

        emit = function(event,id,elt_map){
            if(event == 'upload'){
                var values = {};
                io.socket.get('/csrfToken',function(data){
                    values._csrf=data._csrf;
                    values.elt = elt_map;
                    values.elt_id  = id;
                    console.log(data._csrf);
                    io.socket.post('/math/admin_update/',values,function(res,jwres){
                        if(res && !res.error){
                            if(callback_map.upload){
                                callback_map.upload(res);
                            }
                        }else{
                            console.error('Data is undefined '+ jwres +'\nError :'+res.error);
                            if(callback_map.error)
                                callback_map.error();
                        }
                    });
                });
            }
        };

        return {
            on   : on,
            emit : emit
        };

    };


    getCompletionTagIo = function(){
        var on, emit, callback_map = {};

        on = function(event, callback){
            callback_map[event] = callback;
        };

        emit = function(event,data){
            if(event == 'complete'){
                if( stateMap.completionsTag[data.term]){
                    return callback_map.complete(stateMap.completionsTag[data.term]);
                }

                io.socket.get('/math/completion_tag/'+encodeURI(data.term),function(res,jwres){
                    if(res){
                        stateMap.completionsTag[data.term] = res;
                        callback_map.complete(res);
                    }else{
                        callback_map.error('Data is undefined '+ jwres);
                    }
                });
            };
        };
        return {
            on   : on,
            emit : emit
        };
    };

    getCompletionMentionIo = function(){
        var on, emit, callback_map = {};

        on = function(event, callback){
            callback_map[event] = callback;
        };

        emit = function(event,data){
            if(event == 'complete'){

                if( stateMap.completionsMention[data.term]){
                    return callback_map.complete(stateMap.completionsMention[data.term]);
                }

                io.socket.get('/math/completion_mention/'+encodeURI(data.term),function(res,jwres){
                    if(res){
                        stateMap.completionsMention[data.term] = res;
                        callback_map.complete(res);
                    }else{
                        callback_map.error('Data is undefined '+ jwres);
                    }
                });
            };
        };
        return {
            on   : on,
            emit : emit
        };
    };

        return {
            getGetDataIo    : getDataIo,
            getCreateDataIo : getCreateDataIo,
            getUpdateDataIo : getUpdateDataIo,
            getCompletionTagIo : getCompletionTagIo,
            getCompletionMentionIo : getCompletionMentionIo
        };
    }());
