module.exports = function (grunt) {

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-mocha');

    grunt.initConfig({

        jshint: {
            all: ['src/dom.js', 'test/spec/**/*.js']
        },

        copy: {
            all: {
                files: {
                    'build/dom.js': ['src/dom.js']
                }
            }
        },

        uglify: {
            all: {
                files: {
                    'build/dom.min.js': ['src/dom.js']
                }
            }
        },

        mocha: {
            all: {
                src: ['test/index.html'],
                options: {
                    log: true,
                    reporter: 'Spec',
                    run: false
                }
            }
        }

    });

    grunt.registerTask('default', ['test', 'build']);
    grunt.registerTask('test', ['jshint', 'mocha']);
    grunt.registerTask('build', ['jshint', 'uglify', 'copy']);

};