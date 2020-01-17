var gulp = require('gulp');
var browserSync = require('browser-sync');
// var htmlInjector = require('bs-html-injector');

var sass = require('./sass');
var fonts = require('./fonts');
var templates = require('./templates');
var scripts = require('./scripts');
var vendor = require('./vendor');
var images = require('./images');
var paths = require('./paths');

gulp.task('styles', sass.dev);
gulp.task('fonts', fonts.dev);
gulp.task('templates', templates.dev);
gulp.task('scripts', scripts.dev);
gulp.task('vendor', vendor.dev);
gulp.task('images', images.dev);

module.exports = function() {
	gulp.start('styles', 'fonts', 'templates', 'scripts', 'vendor', 'images');
	gulp.watch(paths.styles.watch, ['styles']);
	gulp.watch(paths.fonts.watch, ['fonts']);
	gulp.watch(paths.templates.watch, ['templates']);
	gulp.watch(paths.scripts.watch, ['scripts']);
	gulp.watch(paths.vendor.watch, ['vendor']);
	gulp.watch(paths.images.watch, ['images']);

	// init server
	// browserSync.use(htmlInjector, {
	// 	files: 'app/*.html'
	// });
	browserSync.init({
		server: 'app'
	});
	// gulp.watch(['app/**'], browserSync.reload);
};
