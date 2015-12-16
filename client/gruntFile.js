//包含整个grunt的配置信息
module.exports = function( grunt ){

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-html2js');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-recess');

    grunt.registerTask('default', ['jshint','build','karma:unit']);
    grunt.registerTask('build', ['clean','html2js','concat','recess:build','copy:assets']);

    var karmaConfig = function(configFile, customOptions) {
        var options = { configFile: configFile, keepalive: true };
        var travisOptions = process.env.TRAVIS && { browsers: ['Firefox'], reporters: 'dots' };
        return grunt.util._.extend(options, customOptions, travisOptions);
    };

    //初始化config对象
    grunt.initConfig({

        distdir: "dist",

        pkg: grunt.file.readJSON("package.json"),

        banner: '/* <%= pkg.name %> - v <%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> \n' +
            '<%= pkg.homepage %> \n' +
            ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>' +
            ' \n*/\n ',

        src: {                                        //相应文件所在目录
            js: ['src/**/*.js'],
            jsTpl: ['<%= distdir %>/templates/**/*.js'],
            specs: ['test/**/*.spec.js'],
            scenarios: ['test/**/*.scenario.js'],
            html: ['src/index.html'],
            tpl: {
                app: ['src/app/**/*.tpl.html'],
                common: ['src/common/**/*.tpl.html']
            },
            less: ['src/less/stylesheet.less'],
            lessWatch: ['src/less/**/*.less']
        },

        clean: ['<%= distdir %>/*'],  //test

        copy : {
            assets: {  //test 复制assets资料
                files: [{ dest: '<%= distdir %>', src: '**', expand: true, cwd: 'src/assets/' }]
            }
        },

        karma: {  //运行jasmine测试
            unit: { options: karmaConfig('test/config/unit.js') },
            watch: { options: karmaConfig('test/config/unit.js',{ singleRun: false, autoRun: true }) }
        },

        html2js: {  //编译angularJS模板为javascript
            app: {
                options: {
                    base: "src/app"  //app内的html模板编译到templates内的app.js
                },
                src: ['<%= src.tpl.app %>'],
                dest: '<%= distdir %>/templates/app.js',
                module: 'templates.app'
            },
            common: {
                options: {
                    base: "src/common"  //common内的html模板编译到templates内的common.js
                },
                src: ['<%= src.tpl.common %>'],
                dest: '<%= distdir %>/templates/common.js',
                module: 'templates.common'
            }
        },

        concat: {  //连接相关文件
            dist: {
                options: {
                    banner: '<%= banner %>'
                },
                src: ['<%= src.js %>','<%= src.jsTpl %>'],  //src内的js文件以及templates内的js文件
                dest: '<%= distdir %>/<%= pkg.name %>.js'  //保存在scrum.js中
            },
            index: {
                src: ['src/index.html'],
                dest: '<%= distdir %>/index.html',
                options: {
                    process: true
                }
            },
            angular: {
                src: ['vendor/angular/angular.js','vendor/angular/angular-route.js'],
                dest:'<%= distdir %>/angular.js'
            },
            mongo: {
                src: ['vendor/mongolab/*.js'],
                dest: '<%= distdir %>/mongolab.js'
            },
            bootstrap: {
                src: ['vendor/angular-ui/bootstrap/*.js'],
                dest: '<%= distdir %>/bootstrap.js'
            },
            jquery: {
                src: ['vendor/jquery/*.js'],
                dest: '<%= distdir %>/jquery.js'
            }
        },

        uglify: {  //tested uglify
            dist:{
                options: {
                    banner: "<%= banner %>"
                },
                src:['<%= src.js %>' ,'<%= src.jsTpl %>'],
                dest:'<%= distdir %>/<%= pkg.name %>.js'
            },
            angular: {
                src:['<%= concat.angular.src %>'],
                dest: '<%= distdir %>/angular.js'
            },
            mongo: {
                src:['vendor/mongolab/*.js'],
                dest: '<%= distdir %>/mongolab.js'
            },
            bootstrap: {
                src:['vendor/angular-ui/bootstrap/*.js'],
                dest: '<%= distdir %>/bootstrap.js'
            },
            jquery: {
                src:['vendor/jquery/*.js'],
                dest: '<%= distdir %>/jquery.js'
            }
        },
        recess: {  //recess:build has been tested
            build: {
                files: {
                    '<%= distdir %>/<%= pkg.name %>.css': ['<%= src.less %>']
                },
                options: {
                    compile: true
                }
            },
            min: {
                files: {
                    '<%= distdir %>/<%= pkg.name %>.css': ['<%= src.less %>']
                },
                options: {
                    compress: true
                }
            }
        },
        jshint: {  //test
            files: ['gruntFile.js','<%= src.js %>','<%= src.jsTpl %>','<%= src.specs %>','<%= src.scenarios %>'],
            options: {
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                boss: true,
                eqnull: true,
                globals: {}
            }
        }
    });

};