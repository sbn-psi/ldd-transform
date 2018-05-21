module.exports = function(grunt) {

    var files = [{
        expand: true,
        src: [
            '**/*',
            '!build',
            '!build/**/*',
            '!node_modules',
            '!node_modules/**/*',
            '!.git'
        ],
        dest: 'build/'
    }];

    grunt.initConfig({
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

    var env = grunt.option('env') || 'dev';
    console.log(env);

    grunt.registerTask('deploy:dev', ['copy:dev']);
    grunt.registerTask('deploy:production', ['copy:production']);
};