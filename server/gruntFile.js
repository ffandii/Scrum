/*global module*/

module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-contrib-jshint');

    // 项目的配置.
    grunt.initConfig({

        jshint: {
            files: ['gruntFile.js', 'server.js', 'lib/*.js'],
            options: {
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                boss: true,
                eqnull: true,
                globals: { require: false, __dirname: false, console: false, module: false, exports: false }
            }
        }
    });

    // 默认的任务.
    grunt.registerTask('default', ['jshint']);
};
