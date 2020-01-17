var gulp = require('gulp');
var plumber = require('gulp-plumber');
var cache = require('gulp-cache');
var flatten = require('gulp-flatten');
var imagemin = require('gulp-imagemin');

var onError = require('./onError');
var paths = require('./paths');

module.exports = {
	dev: function() {
		gulp
			.src(paths.images.src)
			.pipe(plumber({ errorHandler: onError }))
			.pipe(
				cache(
					imagemin({
						optimizationLevel: 3,
						progressive: true,
						interlaced: true
					})
				)
			)
			.pipe(flatten()) // Remove or replace relative path for files
			.pipe(gulp.dest(paths.images.dev));
	},
	prod: function() {
		gulp
			.src(paths.images.src)
			.pipe(plumber({ errorHandler: onError }))
			.pipe(
				cache(
					imagemin({
						optimizationLevel: 3,
						progressive: true,
						interlaced: true
					})
				)
			)
			.pipe(flatten()) // Remove or replace relative path for files
			.pipe(gulp.dest(paths.images.prod));
	}
};
