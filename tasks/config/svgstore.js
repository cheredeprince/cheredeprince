/**
 * SVG Store.
 *
 * ---------------------------------------------------------------
 *
 * Make SVG sprite
 *
 * For usage docs see:
 * 		https://github.com/gruntjs/grunt-svgstore
 */

module.exports = function(grunt) {

    grunt.config.set('svgstore', {
	dev:{
	    options: {
		prefix : 'icon-', // This will prefix each ID
		svg: { // will add and overide the the default xmlns="http://www.w3.org/2000/svg" attribute to the resulting SVG
		    viewBox : '0 0 100 100',
		    xmlns: 'http://www.w3.org/2000/svg'
		}
	    },
	    default:{
		files:{
		    'dest.svg':['assets/images/sprites/categories/*']
		}
	    }
	}
    });
    
    grunt.loadNpmTasks('grunt-svgstore');
};
