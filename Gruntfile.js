module.exports = function (grunt) {
 
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
 
        clean: ["dist", '.tmp'],
 
        copy: {
            main: {
                expand: true,
                cwd: 'public_html/',
                src: ['**', '!stylesheets/**', '!javascripts/**', '!bower_components/**'],
                dest: 'dist/public_html'
            }
        },
 
        rev: {
            files: {
                src: ['dist/**/*.{js,css}']
            }
        },
 
        useminPrepare: {
            html: 'public_html/index.html'
        },
 
        usemin: {
            html: ['dist/public_html/index.html']
        },
 
        uglify: {
            options: {
                report: 'min',
                mangle: false
            }
        }
    });
 
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-rev');
    grunt.loadNpmTasks('grunt-usemin');
 
    // Tell Grunt what to do when we type "grunt" into the terminal
    grunt.registerTask('default', [
        'copy', 'useminPrepare', 'concat', 'uglify', 'cssmin', 'rev', 'usemin'
    ]);
};