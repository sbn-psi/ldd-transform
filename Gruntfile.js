module.exports = function(grunt) {

    var files = [{
        expand: true,
        src: [
            'public/**/*',
            '!**/legend/*',
            '*',
            '!node_modules',
            '!.git'
        ],
        dest: 'build/',
        options: {
            noProcess: '**/*.png'
        }
    }];

    grunt.initConfig({
        clean: ['build'],
        copy: {
            dev: {
                files: files
            },
            production: {
                files: files,
                options: {
                    process: function(content,srcpath) {
                        content = content
                            .replace('<base href="/">','<base href="/ld3/">')
                            .replace('<base href="/graph/">','<base href="/ld3/graph/">')

                        return content;
                    }
                }
            },
            images: {
                expand: true,
                flatten: true,
                src: 'public/graph/img/legend.png',
                dest: 'build/public/graph/img/'
            }
        },
        protractor: {
            runAll: {
                options: {
                    configFile: './tests/protractor.conf.js',
                    keepAlive: false,
                    noColor: false
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-protractor-runner');

    grunt.registerTask('deploy:dev', ['clean', 'copy:dev', 'copy:images']);
    grunt.registerTask('deploy:production', ['clean', 'copy:production', 'copy:images']);
    grunt.registerTask('test', ['protractor:runAll']);
};
