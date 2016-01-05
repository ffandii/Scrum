/* Global modules */

module.exports = function( grunt ) {

    grunt.loadNpmTasks('grunt-contrib-jshint');

    //project configuration
    grunt.initConfig({
        watch: {
            files: '<config:lint.files>',
            tasks: 'default timestamp'
        },
        jshint: {
            files: ['gruntFile.js','lib/*.js'],
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
                globals: {require: false, __dirname: false, console: false,module: false, exports: false}
            }
        }
    });

    //Default tasks
    grunt.registerTask('default',['jshint']);

    grunt.registerTask('timestamp',function(){
        grunt.log.subhead(Date());
    });

    grunt.registerTask('supervise',function(){
        this.async();
        require('supervisor').run(['server.js']);
    });

};