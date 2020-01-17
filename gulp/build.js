var gulp = require('gulp');
var sass = require('./sass');
var fonts = require('./fonts');
var templates = require('./templates');
var scripts = require('./scripts');
var vendor = require('./vendor');
var images = require('./images');
var paths = require('./paths');

gulp.task('styles-b', sass.prod);
gulp.task('fonts-b', fonts.prod);
gulp.task('templates-b', templates.prod);
gulp.task('scripts-b', scripts.prod);
gulp.task('vendor-b', vendor.prod);
gulp.task('images-b', images.prod);

module.exports = function() {
	gulp.start('styles-b', 'fonts-b', 'templates-b', 'scripts-b', 'vendor-b', 'images-b');
};
