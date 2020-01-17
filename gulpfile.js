var gulp = require('gulp');
var build = require('./gulp/build');
var dev = require('./gulp/dev');
var prod = require('./gulp/prod');

gulp.task('default', function() {
	build();
});

// Use to build app
gulp.task('build', function() {
	build();
});

// Use for development
gulp.task('dev', function() {
	dev();
});

// Use to check production build
gulp.task('prod', function() {
	prod();
});
