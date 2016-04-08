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

    grunt.registerTask('default', ['jshint','build']);
    grunt.registerTask('build', ['clean','html2js','concat','recess:build','copy:assets']);

    var karmaConfig = function(configFile, customOptions) {
        var options = { configFile: configFile, keepalive: true };
        var travisOptions = process.env.TRAVIS && { browsers: ['Firefox'], reporters: 'dots' };
        return grunt.util._.extend(options, customOptions, travisOptions);
    };

    //初始化config对象
    grunt.initConfig({

        distdir: "dist",  //生产部署时的目录

        pkg: grunt.file.readJSON("package.json"),

        banner: '/* <%= pkg.name %> - v <%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> \n' +
            '<%= pkg.homepage %> \n' +
            ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>' +
            ' \n*/\n ',

        src: {                                        //相应文件所在目录
            js: ['src/**/*.js'],
            jsTpl: ['<%= distdir %>/templates/**/*.js'],
            specs: ['test/**/*.spec.js'],  //运行karma runner时测试文件所在目录
            html: ['src/index.html'],      //index.html
            tpl: {
                app: ['src/app/**/*.tpl.html'],
                common: ['src/common/**/*.tpl.html']  //common中包含的为基础服务
            },
            less: ['src/less/stylesheet.less'],
            lessWatch: ['src/less/**/*.less']
        },

        clean: ['<%= distdir %>/*'],  //清除部署文件

        copy : {
            assets: {  // 复制assets资料
                files: [{ dest: '<%= distdir %>', src: '**', expand: true, cwd: 'src/assets/' }]
            }
        },

        html2js: {  //解析html模板为js文件，缓存在$templateCache中
            app: {
                options: {
                    base: "src/app"  //app内的html模板编译到templates内的app.js
                },
                src: ['<%= src.tpl.app %>'],
                dest: '<%= distdir %>/templates/app.js',
                module: 'templates.app'  //定义为templates.app模块
            },
            common: {
                options: {
                    base: "src/common"  //common内的html模板编译到templates内的common.js
                },
                src: ['<%= src.tpl.common %>'],
                dest: '<%= distdir %>/templates/common.js',
                module: 'templates.common'  //定义为templates.common模块
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

        uglify: {  //压缩相应的文件
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
        recess: {  //less文件转css文件 并压缩
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
        jshint: {  //js语法检测 options为一些检测时的附加选项
            files: ['gruntFile.js','<%= src.js %>','<%= src.jsTpl %>','<%= src.specs %>'],
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