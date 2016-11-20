const gulp = require('gulp');
const babel = require('gulp-babel');
const del = require('del');
const { exec, spawn } = require('child_process');
const mocha = require('gulp-mocha');

const paths = {
  allSrcJs: 'src/**/*.js',
  libDir: 'lib',
};

gulp.task('clean', () => {
  return del(paths.libDir);
});

gulp.task('build', ['clean'], () => {
  return gulp.src(paths.allSrcJs)
    .pipe(babel())
    .pipe(gulp.dest(paths.libDir));
});

gulp.task('main', ['build'], (callback) => {
  exec(`node ${paths.libDir}`, (error, stdout) => {
    console.log(stdout);
    return callback(error);
  });
});

gulp.task('watch', () => {
  gulp.watch(paths.allSrcJs, ['main']);
});

gulp.task('test:watch', () => {
  let p;
  gulp.watch(paths.allSrcJs, ()=>{
    if (p) p.kill();
    p = spawn('gulp', ['test'], {stdio: 'inherit'});
  });
});

gulp.task('test', () =>
    gulp.src(['src/**/*.integration.js', 'mocha.global.js'], {read: false})
        .pipe(babel())
        // gulp-mocha needs filepaths so you can't have any plugins before it
        .pipe(mocha({reporter: 'nyan'}))
        .on('error', function (err) {
          console.log(err.stack);
        })
        .on('end', function(err) {
          console.log(`Test Finished`);
        })
);

gulp.task('default', ['watch', 'main']);
