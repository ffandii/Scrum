//包含整个grunt的配置信息
module.exports = function( grunt ){

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

        clean: '[<%= pkg.distdir %>/*]',

        copy : {
            assets: {
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
                dest: ['<%= distdir %>/templates/app.js'],
                module: 'templates.app'
            },
            common: {
                options: {
                    base: "src/common"  //common内的html模板编译到templates内的common.js
                },
                src: ['<%= src.tpl.common %>'],
                dest: ['<%= distdir %>/templates/common.js'],
                module: 'templates.common'
            }
        },

        concat: {  //连接相关文件
            dist: {
                options: {
                    banner: '<%= banner %>'
                },
                src: ['<%= src.js %>','<%= src.jsTpl %>'],  //src内的js文件以及templates内的js文件
                dest: '<%= distdir %>/<% pkg.name %>.js'  //保存在scrum.js中
            },
            index: {
                src: ['src/index.html'],
                dest: ['<%= distdir %>/index.html'],
                options: {
                    process: true
                }
            }
        }
    });

};