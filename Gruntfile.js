module.exports = function(grunt) {

    var files = [{
        expand: true,
        src: [
            'public/**/*',
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
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask('deploy:dev', ['clean', 'copy:dev']);
    grunt.registerTask('deploy:production', ['clean', 'copy:production']);
};