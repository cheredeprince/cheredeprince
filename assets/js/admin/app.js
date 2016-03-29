io.socket.on('connect', function(){
    

    if($("[data-model=blog]").length){

	function onAnyChanges(){
    	    if(!wait){
		$("#io-status-icon").attr('src','/images/admin/io-loader.gif')
		wait=true;
		setTimeout(function(){
		    io.socket.get('/csrfToken',function(data){
			var values = {
			    id: id,
			    name: $('[data-model=blog]>[name=name]').val(),
			    title: $('[name=title]').val(),
			    category: $('[name=category]').val(),
			    published: $('[name=published]:checked').val(),
			    presentation: $('[name=presentation]').val(),
			    introBB: $('[name=introBB]').val(),
			    textBB: $('[name=textBB]').val()
			}
			
			values._csrf=data._csrf
     			io.socket.post('/blog/update/'+id,values,function(data,j){
			    wait = false;
			    if(data && data.err){
				$("#io-status-icon").attr('src','/images/admin/io-error.png')
			    }
			    else
				$("#io-status-icon").attr('src','/images/admin/io-ok.png')
			})    

		    })	    
		},1000)
    	    }
    	}
	
    	var wait = false,
     	    id=$("[data-model=blog]").attr('data-id');
	
    	$("[data-save=auto]").change(onAnyChanges)
	$("[data-save=auto]").keyup(onAnyChanges)
    }


    

    if($("[data-entry=URI]").length){

    var simply=function(string){
	if(typeof string != 'string') return '';
	else{
	    var simpleString = string.trim()
		    .replace(/ /g,'-')
	            .replace(/[èéêë]/g,"e")
		    .replace(/[àâä]/g,"a")
		    .replace(/[ûüù]/g,"u")
		    .replace(/ç/g,"c")
		    .replace(/[ôö]/g,"o")
		    .replace(/[ïî]/g,"i")
		    .replace(/["'\\$:;,\?\.\!\(\)\[\]#$£*/]/g,"")
		    .toLowerCase();
	    return simpleString;
	}
	    
    },

    isValidURI=function(string){
	return typeof string == 'string' && string == encodeURI(simply(string))
    };
	
	$("[data-entry=URI]").keyup(function(e){
	    $('[data-output="URI"][data-entry-name="'+$(e.target).attr('name')+'"]').val(simply(e.target.value))
	    if(isValidURI(simply(e.target.value)))
		$('[data-output="URI"][data-entry-name="'+$(e.target).attr('name')+'"]').css("border-color",'green')
		else
		    $('[data-output="URI"][data-entry-name="'+$(e.target).attr('name')+'"]').css("border-color","red")
	})

	$("[data-output=URI]").keyup(function(e){
	    if(isValidURI(simply(e.target.value)))
		$(e.target).css("border-color",'green')
	    else
		$(e.target).css("border-color","red")
		})
    }
    
    // io.socket.get('/user/subscribe')

    // io.socket.on('user',function(obj){
    // 	console.log(obj)
    // 	var page = document.location.pathname.replace(/(\/)$/,'')
    // 	if( page =='/user'){
    // 	    switch(obj.verb){
    // 	    case 'updated': User.update(obj.id,obj)
    // 		break;
    // 	    case 'created': User.create(obj)
    // 		break;
    // 	    case 'destroyed': User.destroy(obj.id)
    // 	    }
    // 	}
    
    // })

    // var User = {
    // 	update :function(id, obj){
    // 	    if(obj.data.attr){
    // 		var $userRow = $('tr[data-id="'+id+'"] td[data-attr="'+obj.data.attr+'"]'),
    // 		    value= obj.data[obj.data.attr]
    // 		switch(obj.data.attr){
    // 		case 'loggedIn': $userRow.css("color", (value)? 'green':'gray');
    // 		    break;
    // 		case 'admin': $userRow.css("color", (value)? 'green':'gray');
    // 		    break;
    // 		default: console.log(value)
    // 		    $userRow.html(value)
    // 		    break;
    // 		}

    // 	    }
    // 	},
    // 	create: function(obj){
    // 	    var user = obj.data, 
    // 		userRow = 	'<tr data-id="'+user.id+'" data-model="user"><td style="color:gray" data-attr="loggedIn">●</td><td data-attr="name">'+user.name+'</td><td data-attr="email">'+user.email+'</td><td style="color:gray" data-attr="admin">●</td><td><div class="btn-space"><a href="/user/show/'+ user.id+'" class="btn btn-green">Voir </a></div></td><td><div class="btn-space"><a href="/user/edit/'+ user.id+'" class="btn btn-green">Éditer</a></div></td><td><form action="/user/destroy/'+ user.id+'" method="POST" ><input type ="hidden" name="_method" value="delete" /><div class="btn-space"><input type="submit" value="Supprimer" class="btn btn-red"/></div><input type="hidden" name="_csrf" value="'+ window.cdp.csrf +'" /></form></td></tr>'
    // 	    $('tr:last').after(
    // 		userRow
    // 	    )
    // 	},

    // 	destroy: function(id){
    // 	    $('tr[data-id="'+id+'"]').remove()
    // 	}
    // }
})

