module.exports = function (grunt) {
    console.log("asset");
	grunt.registerTask('compileAssets', [
		'clean:dev',
		'jst:dev',
	        'less:dev',
	        'sass:dev',
	        'copy:dev',
	    'coffee:dev',
	]);
};
