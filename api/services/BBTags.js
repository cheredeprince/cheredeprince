var  BBTag = require('bbcode-parser/bbTag'),
    BBCodeParser = require('bbcode-parser')

module.exports={

    text: function(eltName,images,next){
    
	var bbTags ={};// BBCodeParser.defaultTags();
	
	addInlineTags(bbTags,function(){
	    addBlockTags(eltName,images,bbTags,function(){
		next(bbTags)
	    })
	})
    },
    intro: function(next){
	var bbTags = {};

	addInlineTags(bbTags,function(){
	    next(bbTags)
	})
    }
    
}


function addInlineTags(bbTags,next){
    	//texte important
	bbTags["s"] = new  BBTag("s",false,true,true,function(tag,content,attr){
		  return "<strong>"+content+"</strong>";
	});
	//emphase
	bbTags["e"] = new  BBTag("e",false,true,true,function(tag,content,attr){
		  return "<em>"+content+"</em>";
	});
	//supprimé
	bbTags["d"] = new  BBTag("d",false,true,true,function(tag,content,attr){
		  return "<del>"+content+"</del>";
	});
	//exposant
	bbTags["sup"] = new  BBTag("sup",false,true,true,function(tag,content,attr){
	    return "<sup>"+content+"</sup>";
	});
	//indice
	bbTags["sub"] = new  BBTag("sub",false,true,true,function(tag,content,attr){
	    return "<sub>"+content+"</sub>";
	});
	//citation courte
	bbTags["q"] = new  BBTag("q",false,true,true,function(tag,content,attr){
	    return "<q>"+content+"</q>";
	});
	//abbreviation
	bbTags["ab"] = new  BBTag("ab",false,true,true,function(tag,content,attr){
	    if(attr["title"])
		return "<abbr title=\""+attr["title"]+ "\">"+content+"</abbr>";
	    else
		return "<abbr>"+content+"</abbr>";
	});
	//citation d'une oeuvre
	bbTags["c"] = new  BBTag("c",false,true,true,function(tag,content,attr){
	    return "<cite>"+content+"</cite>";
	 });

	//lien interne
	bbTags["a"] = BBTag.createTag("a", function (tag, content, attr) {
	    var link = content;

	    if (attr["site"] != undefined) {
		link = BBCodeParser.escapeHTML(attr["site"]);
	    }

	    if (!BBCodeParser.startsWith(link, "http://") && !BBCodeParser.startsWith(link, "https://")) {
		link = "http://" + link;
	    }
	    return "<a href=\"" + link + "\" >" + content + "</a>";
	});
	//lien externe
	bbTags["url"] = BBTag.createTag("url", function (tag, content, attr) {
	    var link = content;

	    if (attr["site"] != undefined) {
		link = BBCodeParser.escapeHTML(attr["site"]);	    
	    }

	    if (!BBCodeParser.startsWith(link, "http://") && !BBCodeParser.startsWith(link, "https://")) {
		link = "http://" + link;
	    }

	    return "<a href=\"" + link + "\" target=\"_blank\">" + content + "</a>";
	});
    next()
}

function addBlockTags(eltName,images,bbTags,next){
	//citation longue
	bbTags["bq"] = new  BBTag("bq",false,true,false,function(tag,content,attr){
		 if(attr["cite"])
		     return "<blockquote cite=\""+attr["cite"]+ "\">"+content+"</blockquote>";
	    else
		return "<blockquote>"+content+"</blockquote>";
	});
    	//code
	bbTags["code"] = new BBTag("code", true, false, true, function (tag, content, attr) {
	    return "<code><pre>" + content + "</pre></code>";
	    
	});
	//sous titre
	bbTags["h1"] = new  BBTag("h1",false,true,true,function(tag,content,attr){
	    return "<h2>"+content+"</h2>";
	});
	//petit titre
	bbTags["h2"] = new  BBTag("h2",false,true,true,function(tag,content,attr){
	    return "<h3>"+content+"</h3>";
	});
	 //liste ordonnée
	bbTags["ol"] = new  BBTag("ol",false,true,false,function(tag,content,attr){
	    res= "";
	    lis = content.split("[*]")
	    for(var i=1;i<lis.length;i++){
		res +="<li>"+lis[i]+"</li>"
	    }
	    return "<ol>"+res+"</ol>";
	});
	//liste non ordonné
	bbTags["ul"] = new  BBTag("ul",false,true,false,function(tag,content,attr){
	    res= "";
	    lis = content.split("[*]")
	    for(var i=1;i<lis.length;i++){
		res +="<li>"+lis[i]+"</li>"
	    }
	    return "<ul>"+res+"</ul>";
	});
	//paragraphe simple
	bbTags["p"] = new  BBTag("p",false,true,false,function(tag,content,attr){
	    return "<p>"+content+"</p>";
	});
	//paragraphe avec une image flottante

	//figure avec image et description en option
	bbTags["fig"] = BBTag.createTag("fig", function (tag, content, attr) {
	    var caption = content;

	    if (attr["img"] != undefined) {
		var link = BBCodeParser.escapeHTML(attr["img"]);	    
	    }
	    if(images[link]){
		switch(images[link].ext){
		case 'svg': return "<figure><object data=\"" + '/images/blog/'+eltName+'/'+link+'.svg' + "\">"+images[link].alt+"</object><figcaption>" + caption + "</figcaption></figure>";
		    break;
		    
		case 'jpg': return "<figure>"+
			"<a href=\""+'/images/blog/'+eltName+'/'+link+'-light.jpg' +"\">" +
			"<picture>"+
			"<source media=\"(min-width:18em)\" srcset=\""+'/images/blog/'+eltName+'/'+link+'-medium.jpg' +"\">"+
			"<img srcset=\"" + '/images/blog/'+eltName+'/'+link+'-little.jpg'+"\" alt=\""+images[link].alt+"\"/>"+
			"</picture>"+
			"</a>"+
		    "<figcaption>" + content + "</figcaption></figure>";
		    break;
		    
		case 'png':return "<figure>"+
			"<a href=\""+'/images/blog/'+eltName+'/'+link+'.png' +"\">" +
			"<picture>"+
			"<source media=\"(min-width:18em)\" srcset=\""+'/images/blog/'+eltName+'/'+link+'-medium.png' +"\">"+
			"<img srcset=\"" + '/images/blog/'+eltName+'/'+link+'-little.png' + "\" alt=\""+images[link].alt+"\"/>"+
			"</picture>"+
			"</a>"+
			"<figcaption>" + content + "</figcaption></figure>";
		    break;
		}
		
		
	    }else if (!BBCodeParser.startsWith(link, "http://") && !BBCodeParser.startsWith(link, "https://")) {
		link = "http://" + link;
		return "<figure><img src=\"" + link + "\"/><figcaption>" + content + "</figcation></figure>";
	    }

	    
	});
    next()
}
