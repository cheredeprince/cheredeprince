/*
 * data comment module
 */

math.data.comment = (function(){

    var
    configMap = {
        loadingTime: 2000
    },

    stateMap = {
    },

    getCommentIo;

    getCommentIo = function(){
        var on ,subscribe, emit, callback_map = {};
        
        on = function(event, callback){
            callback_map[event] = callback;
        };

        subscribe = function(){
            io.socket.get('/math/subscribe');
        };

        emit = function(event,flux_nb,response_to,content){
            if(event == 'add'){

                var values = {};
                io.socket.get('/csrfToken',function(data){
                    values._csrf = data._csrf;
                    values.flux_nb = flux_nb;
                    values.response_to = response_to;
                    values.content = content;

                    io.socket.post('/mathcomment/create/',values,function(res,jwres){
                        if(res && !res.error){
                            if(callback_map.add){
                                callback_map.add(res);
                            }
                        }else{
                            console.error('Data is undefined '+ jwres +'\nError :'+res.error);
                            if(callback_map.error)
                                callback_map.error();
                        }
                    });
                });
            } else if(event == 'subscribe'){
                
            }
        };
        return {
            on   : on,
            emit : emit
        };
    };

        return {
            getCommentIo : getCommentIo
        };
    }());
