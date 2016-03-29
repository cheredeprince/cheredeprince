module.exports = function (grunt) {
    console.log("syncAssets")
	grunt.registerTask('syncAssets', [
		'jst:dev',
	        'less:dev',
	        'sass:dev',
		'sync:dev',
		'coffee:dev'
	]);
};
