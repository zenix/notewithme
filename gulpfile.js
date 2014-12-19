var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rev = require('gulp-rev');
var ngmin = require('gulp-ngmin');
var replace = require('gulp-html-replace');

gulp.task('scripts', function() {
    return gulp.src('public_html/javascripts/*.js')
        .pipe(concat('notewithmeapplication.min.js'))
        .pipe(ngmin())
        .pipe(uglify())
        .pipe(gulp.dest('dist/public_html'))
});

gulp.task('rev', function() {
    return gulp.src(['dist/**/*.js'])
        .pipe(rev())
        .pipe(gulp.dest('dist'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('dist'));
});

gulp.task('replace', function(){
    gulp.src('dist/public_html/index.html')
        .pipe(htmlreplace({
            'js': 'file.js'
        }))
})
// ehkä https://www.npmjs.com/package/gulp-rev-replace
gulp.task('build', ['scripts', 'rev', 'replace'], function(){})