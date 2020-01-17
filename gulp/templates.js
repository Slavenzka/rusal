var gulp = require('gulp');
var pug = require('gulp-pug');
var plumber = require('gulp-plumber');

var onError = require('./onError');
var paths = require('./paths');

module.exports = {
	dev: function() {
		gulp
			.src(paths.templates.src)
			.pipe(plumber({ errorHandler: onError }))
			.pipe(pug({ pretty: true }))
			.pipe(gulp.dest(paths.templates.dev));
	},
	prod: function() {
		gulp
			.src(paths.templates.src)
			.pipe(plumber({ errorHandler: onError }))
			.pipe(pug())
			.pipe(gulp.dest(paths.templates.prod));
	}
};
