module.exports = function(grunt) {
    grunt.initConfig({
        protractor: {
            options: {
                configFile: './tests/protractor.conf.js',
                keepAlive: false,
                noColor: false
            },
            runAll: {
                options: {
                    args: {
                        suite: 'all'
                    }
                }
            },
            class: {
                options: {
                    args: {
                        suite: 'class'
                    }
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-protractor-runner');

    grunt.registerTask('test', ['protractor:runAll']);
    grunt.registerTask('test:class', ['protractor:class']);
};
