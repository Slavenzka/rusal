var gulp = require('gulp');
var plumber = require('gulp-plumber');

var onError = require('./onError');
var paths = require('./paths');

module.exports = {
	dev: function() {
		gulp
			.src(paths.fonts.src)
			.pipe(plumber({ errorHandler: onError }))
			.pipe(gulp.dest(paths.fonts.dev));
	},
	prod: function() {
		gulp
			.src(paths.fonts.src)
			.pipe(plumber({ errorHandler: onError }))
			.pipe(gulp.dest(paths.fonts.prod));
	}
};
