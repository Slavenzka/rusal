var gulp = require('gulp');
var browserSync = require('browser-sync');
var htmlInjector = require('bs-html-injector');

var sass = require('./sass');
var fonts = require('./fonts');
var templates = require('./templates');
var scripts = require('./scripts');
var vendor = require('./vendor');
var images = require('./images');
var paths = require('./paths');

gulp.task('styles-p', sass.prod);
gulp.task('fonts-p', fonts.prod);
gulp.task('templates-p', templates.prod);
gulp.task('scripts-p', scripts.prod);
gulp.task('vendor-p', vendor.prod);
gulp.task('images-p', images.prod);

module.exports = function() {
	gulp.start('styles-p', 'fonts-p', 'templates-p', 'scripts-p', 'vendor-p', 'images-p');
	gulp.watch(paths.styles.watch, ['styles-p']);
	gulp.watch(paths.fonts.prod, ['fonts-p']);
	gulp.watch(paths.templates.watch, ['templates-p']);
	gulp.watch(paths.scripts.prod, ['scripts-p']);
	gulp.watch(paths.vendor.prod, ['vendor-p']);
	gulp.watch(paths.images.prod, ['images-p']);

	// init server
	browserSync.use(htmlInjector, {
		files: 'build/app/*.html'
	});
	browserSync.init({
		server: 'build/app'
	});
	gulp.watch(['build/app/**'], browserSync.reload);
};
