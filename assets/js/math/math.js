/* 
 *math.js
 *module à la racine de l'app
 */

var math = (function(){
    var initModule = function($container) {
	// Iniatialize math.shell
	math.shell.initModule( $container );
    };

	var colorPerType={
	    def   : '#1B791B',
	    lem   : '#3C1E67',
	    prop  : '#1D3D63',
	    th    : '#985022',
	    cor   : '#987A22',
	    axiom : '#889421',
	    conj  : '#7F1C4B',
	    undefined : "gray"
	}
    
    var typeColor = function(type_name){
	if(colorPerType[type_name]){
	    return colorPerType[type_name]
	}else
	    return colorPerType['undefined']
	
    }
    
    return {initModule: initModule,
	    typeColor: typeColor};
}());


window.onload = function(){
//    setTimeout(function(){    $(window).resize()},100)

}
