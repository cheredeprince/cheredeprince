module.exports = function (grunt) {
    grunt.registerTask('default', ['compileAssets', 'linkAssets',  'watch', 'svgstore:dev']);
};
