/*Mail Services */

var Nodemailer = require('nodemailer');

module.exports={
    sendLog : function(subject,message,next){
	var header = {
	    from:{
		name: 'Log de Chère de Prince',
		email: 'becasse@cheredeprince.net'
	    },
	    to:{
		name: 'La Bécasse',
		email: sails.config.variables.general.logMail
	    },
	    subject: subject
	}

	send(header,message,function(err){
	    if(err) return next(err)

	    next(null);
	})
	
    },
    sendMessage : function(name,email,url,message,next){
	var endMessage;
	//on crée une fin de message
	if(url){
	    endMessage = '/n'+url;
	}else{
	    endMessage = '';
	}
	    
	var header = {
	    from:{
		name: name,
		email: email
	    },
	    to:{
		name: 'La Bécasse',
		email: sails.config.variables.general.logMail
	    },
	    subject: "Message de "+ name + (url)?'('+url+')':''
	};

	send(header,message + endMessage,function(err){
	    if(err) return next(err);

	    next(null);
	});
	
    },
    sendTo : function(subject,message,recipient,next){
	var header = {
	    from:{
		name: 'Chère de Prince',
		email: 'becasse@cheredeprince.net'
	    },
	    to:{
		name: recipient.name,
		email: recipient.email
	    },
	    subject: subject
	}

	send(header,message ,function(err){
	    if(err) return next(err);

	    next(null);
	})
    }
};

function send(header,message,next){
    var transporter = Nodemailer.createTransport();

    transporter.sendMail({
	from: header.from.name + ' <'+header.from.email +'>',
	to: header.to.name+'<'+header.to.email+'>',
	subject: header.subject,
	text: message
    }, function(err, info){
	if(err){
	    console.log(err);
	    next(err)
	}else{
	    next(null)
	    console.log(info);
	}
    });
}
