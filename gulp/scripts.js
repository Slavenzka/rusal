var gulp = require('gulp');
var plumber = require('gulp-plumber');
var gconcat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var jshint = require('gulp-jshint');
var sourcemaps = require('gulp-sourcemaps');

var onError = require('./onError');
var paths = require('./paths');

module.exports = {
	dev: function() {
		gulp
			.src(paths.scripts.src)
			.pipe(plumber({ errorHandler: onError }))
			.pipe(sourcemaps.init())
			// .pipe(jshint())
			// .pipe(jshint.reporter('default'))
			.pipe(gconcat('main.js'))
			.pipe(sourcemaps.write())
			.pipe(rename({ suffix: '.min' }))
			.pipe(gulp.dest(paths.scripts.dev));
	},
	prod: function() {
		gulp
			.src(paths.scripts.src)
			.pipe(plumber({ errorHandler: onError }))
			// .pipe(jshint())
			// .pipe(jshint.reporter('default'))
			.pipe(uglify())
			.pipe(gconcat('main.js'))
			.pipe(rename({ suffix: '.min' }))
			.pipe(gulp.dest(paths.scripts.prod));
	}
};
