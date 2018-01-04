'use strict';

/* eslint no-process-exit: 0 */
/* eslint no-magic-numbers: 0 */

const browserSync = require('browser-sync'),
    gulp = require('gulp');

const allFiles = ['gulpfile.js', 'redshift', 'src/**/*.js', 'test/**/*.spec.js'],
    sourceFiles = ['src/**/*.js'],
    testFiles = ['test/**/*.spec.js'];

const plugin = require('gulp-load-plugins')();


/**
 * Linting
 *
 * Tests for code quality and source standards.
 */
gulp.task('jshint', () => gulp.src(allFiles)
    .pipe(browserSync.reload({
        stream : true,
        once   : true
    }))
    .pipe(plugin.jshint())
    .pipe(plugin.jshint.reporter('jshint-stylish'))
    .pipe(plugin.if(
        !browserSync.active,
        plugin.jshint.reporter('fail')
    ))
);


/**
 * Code Style
 *
 * Tests for code style accuracy.
 */
gulp.task('eslint', () => gulp.src(allFiles)
    .pipe(plugin.eslint())
    .pipe(plugin.eslint.format())
    .pipe(plugin.eslint.failOnError())
);


/**
 * Linting
 *
 * Runs the linters.
 */
gulp.task('lint', ['jshint', 'eslint'], () => gulp.src(sourceFiles));


/**
 * Testing
 *
 * Lints and tests all of the code.
 */
gulp.task('test', ['lint'], () => gulp.src(testFiles)
    .pipe(plugin.mocha())
    .once('error', () => {

        process.exit(1);

    })
    .once('end', () => {

        process.exit();

    })
);


/**
 * Setup-Coverage
 *
 * Sets up istanbul for watching tests.
 */
gulp.task('setup-coverage', () => gulp.src(sourceFiles)
    .pipe(plugin.istanbul({

        includeUntested : true

    }))
    .pipe(plugin.istanbul.hookRequire())
    .pipe(gulp.dest('coverage/'))
);


/**
 * Coverage
 *
 * Runs a coverage report for the tests.
 */
gulp.task('coverage', ['setup-coverage'], () => gulp.src(testFiles)
    .pipe(plugin.mocha())
    .pipe(plugin.istanbul.writeReports())
    .once('error', () => {

        process.exit(1);

    })
    .once('end', () => {

        process.exit();

    })
);


/**
 * Doc
 *
 * Generates JSDocs for the codebase.
 */
gulp.task('doc', () => gulp.src(sourceFiles, {read : false})
    .pipe(plugin.jsdoc3())
);


/**
 * Changelog
 *
 * Outputs a markdown version of the changelog between the previous two tags.
 */
gulp.task('changelog', () => {

    let tagString = '';

    /**
     * Prints changelog to stdout.
     *
     * @param {string} err the error
     * @param {string} stdout current output
     */
    const printChangeLog = (err, stdout) => {

        if (err) {

            throw err;

        }

        process.stdout.write(`\nChangelog between tags ${tagString}:\n\n`);
        process.stdout.write(`${stdout}\n`);

    };

    /**
     * Adds the previous tag to stdout.
     *
     * @param {string} err the error
     * @param {string} stdout current output
     */
    const getPrevTag = (err, stdout) => {

        if (!err) {

            tagString = `${stdout.trim()}..${tagString}`;

        }

        plugin.git.exec({
            args : `log ${tagString} --no-merges --reverse --pretty=format:'- [view](https://github.com/andrewvaughan/redshift/commit/%H) &bull; %s'`   /* eslint max-len: 0 */
        }, printChangeLog);

    };

    /**
     * Adds the latest tag to stdout.
     *
     * @param {string} err the error
     * @param {string} stdout current output
     */
    const getLatestTag = (err, stdout) => {

        if (err) {

            throw err;

        }

        tagString = stdout.trim();

        plugin.git.exec({args : `describe --abbrev=0 --tags ${tagString}~1`}, getPrevTag);

    };


    // Fire off our chain
    plugin.git.exec({args : 'describe --abbrev=0 --tags'}, getLatestTag);

});
