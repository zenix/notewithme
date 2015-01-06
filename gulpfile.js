var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rev = require('gulp-rev');
var ngmin = require('gulp-ngmin');
var htmlreplace = require('gulp-html-replace');
var runSequence = require('run-sequence');
var vinylPaths = require('vinyl-paths');
var del = require('del');
var mainBowerFiles = require('main-bower-files');

gulp.task('scripts', function() {
    return gulp.src('public_html/javascripts/*.js')
        .pipe(concat('notewithmeapplication.min.js'))
        .pipe(ngmin())
        .pipe(uglify())
        .pipe(rev())
        .pipe(gulp.dest('dist/public_html/javascripts'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('dist/public_html/javascripts'))


})


gulp.task('copy-resources', function(){
    return gulp.src(['public_html/**/', '!public_html/javascripts/**'])
        .pipe(gulp.dest('dist/public_html'))
})

gulp.task('replace-min', function(){
    return gulp.src('dist/public_html/index.html')
        .pipe(htmlreplace({
            'js': 'javascripts/'+require('./dist/public_html/javascripts/rev-manifest.json')['notewithmeapplication.min.js']
        }))
        .pipe(gulp.dest('dist/public_html'))
})

gulp.task('concat-vendor', function(){
    return gulp.src(mainBowerFiles(
        {paths: {bowerDirectory: 'public_html/bower_components', bowerJson: 'bower.json'}}
    ))
        .pipe(concat('vendor.js.min'))
        .pipe(gulp.dest('dist/public_html/javascripts'))
})

gulp.task('clean', function() {
    return gulp.src('dist')
        .pipe(vinylPaths(del))
});

gulp.task('build', function(){
    return runSequence('clean', ['scripts', 'copy-resources'],'replace-min', 'concat-vendor');
})