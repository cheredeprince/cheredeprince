/*
 * data module
 */

math.data = (function(){

    var
    configMap = {
	loadingTime: 10000
    },

    stateMap = {
	completions: {}
    },
    
    getSearchIo, getFindByNameIo, getCompletionIo, getLoadNamesIo,
    getPostGraphIo, getGetGraphIo, getWatchIo;

    getSearchIo = function(){
	var on, emit, callback_map = {};

	on = function(event, callback){
	    callback_map[event] = callback;
	}

	emit = function(event,data){
	    if(event == 'search'){
		io.socket.get('/math/search/'+encodeURI(data.query),function(res,jwres){
		    if(res){
			callback_map.search(res);   
		    }else{
			callback_map.error('Data is undefined '+ jwres)
		    }
		})
	    }
	}

	return {
	    on   : on,
	    emit : emit
	}
    }

    
    getFindByNameIo = function(){
	var on, emit, callback_map = {};

	on = function(event, callback){
	    callback_map[event] = callback;
	}

	emit = function(event,data){
	    if(event == 'find'){
		io.socket.get('/math/find/'+encodeURI(data.name),function(res,jwres){
		    if(res){
			callback_map.find(res);   
		    }else{
			callback_map.error('Data is undefined '+ jwres)
		    }
		})		
	    }
	}
	
	return {
	    on   : on,
	    emit : emit
	}
    }

    getCompletionIo = function(){
	var on, emit, callback_map = {};

	on = function(event, callback){
	    callback_map[event] = callback;
	}

	emit = function(event,data){
	    if(event == 'complete'){
		
		if( stateMap.completions[data.term]){
		    return callback_map.complete(stateMap.completions[data.term]);
		}
		
		io.socket.get('/math/completion/'+encodeURI(data.term),function(res,jwres){
		    if(res){
			stateMap.completions[data.term] = res;
			callback_map.complete(res);   
		    }else{
			callback_map.error('Data is undefined '+ jwres)
		    }
		})
	    }
	}
	return {
	    on   : on,
	    emit : emit
	}
    }


    getLoadNamesIo = function(){
	var on, emit, callback_map = {};

	on = function(event, callback){
	    callback_map[event] = callback;
	}

	emit = function(event,data){
	    if(event == 'load'){
		var timeout = setTimeout(function(){
		    console.warn("time out");
		    delete callback_map.load;
		    if(callback_map.timeout){
			callback_map.timeout();	
		    }
		},configMap.loadingTime)
		
		io.socket.get('/math/load',{names:data.names},function(res,jwres){
		    clearTimeout(timeout);
		    if(res){
			if(callback_map.load){
			    callback_map.load(res);      
			}
		    }else{
			callback_map.error('Data is undefined '+ jwres)
		    }
		})		
	    }
	}
	
	return {
	    on   : on,
	    emit : emit
	}
    },

    getGetGraphIo = function(){
	var on, emit, callback_map = {};

	on = function(event, callback){
	    callback_map[event] = callback;
	};

	emit = function(event){
	    if(event == 'get'){
		io.socket.get('/math/graph/',function(res,jwres){
		    if(res){
			//on ajoute les ids aux arretes
			var edge,cpt;
			for(cpt = 0;cpt<res.edges.length;cpt++){
			    edge = res.edges[cpt];
			    edge.id = edge.source+'>'+edge.target;
			}
			callback_map.get(res);   
		    }else{
			callback_map.error('Data is undefined '+ jwres)
		    }
		})		
	    }
	}
	
	return {
	    on   : on,
	    emit : emit
	}	
    }
    
    getPostGraphIo = function(){
	var on, emit, callback_map = {};

	on = function(event, callback){
	    callback_map[event] = callback;
	};

	emit = function(event,position_map){
	    if(event == 'post'){
		var values = {};
		io.socket.get('/csrfToken',function(data){
		    values._csrf=data._csrf;
		    values.position_map = position_map;
		    
     		    io.socket.post('/math/saveGraph/',values,function(res,jwres){
			if(res){
			    if(callback_map.post){
				callback_map.post(res);      
			    }
			}else{
			    callback_map.error('Data is undefined '+ jwres);
			}
		    });
		});
	    }
	};
	    
	return {
	    on   : on,
	    emit : emit
	}

    }

    getWatchIo = function(){
	var on, init, subscribe, callback_map = {};

	on = function(event, callback){
	    callback_map[event] = callback;
	};

	subscribe = function(){
	    io.socket.get('/math/subscribe');
	};
	
	init = function(event){
	    if(event == 'graph'){
		io.socket.on('mathgraph',function(obj){
		    callback_map['graph'](obj);
		});
	    }
	    if(event == 'elt'){
		io.socket.on('mathelt',function(obj){
		    callback_map['elt'](obj);
		});
	    }
	};
	    
	return {
	    on   : on,
	    init : init,
	    subscribe : subscribe
	}

    }

    
	
	return {
	    getSearchIo : getSearchIo,
	    getFindByNameIo : getFindByNameIo,
	    getCompletionIo : getCompletionIo,
	    getLoadNamesIo  : getLoadNamesIo,
	    getGetGraphIo   : getGetGraphIo,
	    getPostGraphIo  : getPostGraphIo,
	    getWatchIo      : getWatchIo
	}
    }())
