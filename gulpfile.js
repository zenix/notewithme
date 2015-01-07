var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rev = require('gulp-rev');
var htmlreplace = require('gulp-html-replace');
var runSequence = require('run-sequence');
var vinylPaths = require('vinyl-paths');
var del = require('del');
var mainBowerFiles = require('main-bower-files');
var gulpFilter = require('gulp-filter');
var ngAnnotate = require('gulp-ng-annotate');
var through = require('through2');
var fs = require('fs');

var rmOrig = function() {
  return through.obj(function(file, enc, cb) {

    if (file.revOrigPath) {
      fs.unlink(file.revOrigPath, function(err) {
        // TODO: emit an error if err
      });
    }

    this.push(file); // Pass file when you're done
    return cb() // notify through2 you're done
  });
};
//todo: cleanup javascripts / bower_components
// bootsrap-modal only
gulp.task('scripts', function() {
    return gulp.src('public_html/javascripts/*.js')
        .pipe(ngAnnotate())
        .pipe(concat('notewithmeapplication.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist/public_html/javascripts'))


})

gulp.task('revision', function(){
    return gulp.src('dist/public_html/javascripts/*.js')
        .pipe(rev())
        .pipe(gulp.dest('dist/public_html/javascripts'))
        .pipe(rmOrig())
        .pipe(rev.manifest())
        .pipe(gulp.dest('dist/public_html/javascripts'))
})

gulp.task('copy-nodejs', function(){
    return gulp.src(['node_modules', 'app.js','run.sh'])
        .pipe(gulp.dest('dist'))
})

gulp.task('copy-resources', function(){
    return gulp.src(['public_html/**/', '!public_html/javascripts/**', '!public_html/bower_components'])
        .pipe(gulp.dest('dist/public_html'))
})

gulp.task('replace-min', function(){
    return gulp.src('dist/public_html/index.html')
        .pipe(htmlreplace({
            'js': 'javascripts/'+require('./dist/public_html/javascripts/rev-manifest.json')['nwm.min.js']
        }))
        .pipe(gulp.dest('dist/public_html'))
})

gulp.task('concat-vendor', function(){
    var jsFilter = gulpFilter(['*.js']);
    return gulp.src(mainBowerFiles({
            paths: {
                bowerDirectory: 'public_html/bower_components',
                bowerJson: 'bower.json'
            }
        }
        ))
        .pipe(jsFilter)
        .pipe(concat('vendor.min.js'))
        .pipe(jsFilter.restore())
        .pipe(gulp.dest('dist/public_html/javascripts'))
})

gulp.task('scripts-concat', function() {
    return gulp.src(['dist/public_html/javascripts/vendor.min.js','dist/public_html/javascripts/notewithmeapplication.min.js'])
        .pipe(concat('nwm.min.js'))
        .pipe(gulp.dest('dist/public_html/javascripts'))
})


gulp.task('clean', function() {
    return gulp.src('dist')
        .pipe(vinylPaths(del))
});

gulp.task('clean-tmp-files', function() {
    return gulp.src(['dist/public_html/javascripts/notewithmeapplication.min.js', 'dist/public_html/javascripts/vendor.min.js'])
        .pipe(vinylPaths(del))
});

gulp.task('clean-tmp-files', function() {
    return gulp.src(['dist/public_html/javascripts/notewithmeapplication.min.js', 'dist/public_html/javascripts/vendor.min.js'])
        .pipe(vinylPaths(del))
});

gulp.task('build', function(){
    return runSequence('clean', 'scripts', 'copy-resources','copy-nodejs', 'concat-vendor','scripts-concat', 'clean-tmp-files', 'revision','replace-min');
})


