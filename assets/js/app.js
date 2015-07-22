//window.onload= function(){
	//var socket = io.connect();
io.socket.on('connect', function(){
    console.log("connect")
    io.socket.get('/user/subscribe')

    io.socket.on('user',function(obj){
	console.log(obj)
	var page = document.location.pathname.replace(/(\/)$/,'')
	if( page =='/user'){
	    switch(obj.verb){
	    case 'updated': User.update(obj.id,obj)
		break;
	    case 'created': User.create(obj)
		break;
	    case 'destroyed': User.destroy(obj.id)
	    }
	}
	    
    })

    var User = {
	update :function(id, obj){
	    if(obj.data.attr){
		var $userRow = $('tr[data-id="'+id+'"] td[data-attr="'+obj.data.attr+'"]'),
		    value= obj.data[obj.data.attr]
		switch(obj.data.attr){
		case 'loggedIn': $userRow.css("color", (value)? 'green':'gray');
		    break;
		case 'admin': $userRow.css("color", (value)? 'green':'gray');
		    break;
		default: console.log(value)
		    $userRow.html(value)
		    break;
		}

	    }
	},
	create: function(obj){
	    var user = obj.data, 
		userRow = 	'<tr data-id="'+user.id+'" data-model="user"><td style="color:gray" data-attr="loggedIn">●</td><td data-attr="name">'+user.name+'</td><td data-attr="email">'+user.email+'</td><td style="color:gray" data-attr="admin">●</td><td><div class="btn-space"><a href="/user/show/'+ user.id+'" class="btn btn-green">Voir </a></div></td><td><div class="btn-space"><a href="/user/edit/'+ user.id+'" class="btn btn-green">Éditer</a></div></td><td><form action="/user/destroy/'+ user.id+'" method="POST" ><input type ="hidden" name="_method" value="delete" /><div class="btn-space"><input type="submit" value="Supprimer" class="btn btn-red"/></div><input type="hidden" name="_csrf" value="'+ window.cdp.csrf +'" /></form></td></tr>'
	    $('tr:last').after(
		userRow
	    )
	},

	destroy: function(id){
	    $('tr[data-id="'+id+'"]').remove()
	}
    }
})
//}
