module.exports = function (grunt) {
    console.log("build")
	grunt.registerTask('build', [
		'compileAssets',
		'linkAssetsBuild',
		'clean:build',
		'copy:build'
	]);
};
