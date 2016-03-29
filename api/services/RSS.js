var Rss = require('rss'),
    fs = require('fs');

var BlogFeed = new Rss({
    title: "Le Blog de Chère de Prince",
    description: "Vagabondages, mathématiques, web et questionnement d'une bécasse",
    feed_url: sails.config.variables.general.host+"/rss",
    site_url: sails.config.variables.general.host+"/",
    images_url: sails.config.variables.general.host+"/favicon.png",
    language: 'fr-FR'
})

module.exports= {

    addArticle : function(art){
	BlogFeed.item({
	    title: art.title,
	    description: '<a href='+sails.config.variables.general.host+'"/blog/show/'+art.name+'"><img src="/images/blog/'+art.name+'/s/original.png" alt="'+art.stickerAlt+'"></a><br/><br/>'+art.presentation,
	    url: sails.config.variables.general.host+'/blog/'+art.name,
	    guid: sails.config.variables.general.host+'/blog/show/?p='+art.id,
	    categories : art.tags,
	    author: (art.author)?art.author.name:'La Bécasse',
	    date: art.publishedAt    
	})

	var fd = fs.openSync(sails.config.appPath+'/assets/rss/rss.xml', 'w')
	fs.writeSync(fd,BlogFeed.xml())
	console.log(BlogFeed.xml(),sails.config.appPath+'/assets/rss/rss.xml')
	setTimeout(function () {
	    fs.closeSync(fd)
	}, 10000)

    }
    
}
