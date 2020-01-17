var gulp = require('gulp');
var plumber = require('gulp-plumber');
var autoprefixer = require('autoprefixer');
var cssnano = require('cssnano');
var pxtorem = require('postcss-pxtorem');
var postcss = require('gulp-postcss');
var sass = require('gulp-sass');
var sassGlob = require('gulp-sass-glob');
var sourcemaps = require('gulp-sourcemaps');
var onError = require('./onError');
var paths = require('./paths');

var plugins = [
	autoprefixer({
		browsers: ['last 3 versions'],
		cascade: false
	}),
	cssnano({
		preset: 'default',
		zIndex: false,
		sourcemap: true,
		safe: true
	})
];

module.exports = {
	dev: function() {
		gulp
			.src(paths.styles.src)
			.pipe(plumber({ errorHandler: onError }))
			.pipe(sourcemaps.init())
			.pipe(sassGlob())
			.pipe(sass().on('error', sass.logError))
			.pipe(postcss(plugins))
			.pipe(sourcemaps.write())
			.pipe(gulp.dest(paths.styles.dev));
	},
	prod: function() {
		gulp
			.src(paths.styles.src)
			.pipe(plumber({ errorHandler: onError }))
			.pipe(sassGlob())
			.pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
			.pipe(postcss(plugins))
			.pipe(gulp.dest(paths.styles.prod));
	}
};
