var gulp = require('gulp');
var run = require('gulp-run');
// var livereload = require('gulp-livereload');

// gulp.task('build', function(){
//     gulp.watch(['./bundle.js'], ['done']);
// });

// gulp.task('done', function() {
//     livereload();
//   });

gulp.task('watch', function(){
    // livereload.listen();
    gulp.watch(['./*.js', '!./bundle.js'], ['scripts']);
});
// use gulp-run to start a pipeline 
gulp.task('scripts', function() {
    return run('npm run build').exec()    // run "npm start". 
})