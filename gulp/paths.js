module.exports = {
	images: {
		src: 'src/assets/images/**/*',
		dev: 'app/common/images/',
		prod: 'build/app/common/images/',
		watch: 'src/assets/images/*'
	},
	fonts: {
		src: 'src/assets/fonts/*',
		dev: 'app/common/fonts/',
		prod: 'build/app/common/fonts/',
		watch: 'src/assets/fonts/*'
	},
	styles: {
		src: 'src/styles/*.scss',
		dev: 'app/common/style',
		prod: 'build/app/common/style',
		watch: 'src/styles/**/*'
	},
	templates: {
		src: 'src/html/*.pug',
		dev: 'app/',
		prod: 'build/app/',
		watch: 'src/html/**/*'
	},
	scripts: {
		src: 'src/scripts/*.js',
		dev: 'app/common/scripts',
		prod: 'build/app/common/scripts',
		watch: 'src/scripts/*'
	},
	vendor: {
		src: ['src/scripts/libs/jquery-3.4.1.min.js','src/scripts/libs/*'],
		dev: 'app/common/scripts',
		prod: 'build/app/common/scripts',
		watch: 'src/scripts/libs/*'
	}
};
