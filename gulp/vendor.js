var gulp = require('gulp');
var plumber = require('gulp-plumber');
var gconcat = require('gulp-concat');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');

var onError = require('./onError');
var paths = require('./paths');

module.exports = {
	dev: function() {
		gulp
			.src(paths.vendor.src)
			.pipe(plumber({ errorHandler: onError }))
			.pipe(sourcemaps.init())
			.pipe(gconcat('vendor.js'))
			.pipe(sourcemaps.write())
			.pipe(gulp.dest(paths.vendor.dev));
	},
	prod: function() {
		gulp
			.src(paths.vendor.src)
			.pipe(plumber({ errorHandler: onError }))
			.pipe(uglify())
			.pipe(gconcat('vendor.js'))
			.pipe(gulp.dest(paths.vendor.prod));
	}
};
