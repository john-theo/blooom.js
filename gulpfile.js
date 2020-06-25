"use strict";

const gulp = require("gulp");
const sass = require("gulp-sass");
const uglifycss = require("gulp-uglifycss");
const rename = require("gulp-rename");
const autoprefixer = require("gulp-autoprefixer");
const babel = require("gulp-babel");
const sourcemaps = require("gulp-sourcemaps");
const concat = require("gulp-concat");
const terser = require("gulp-terser");
const strip = require("gulp-strip-comments");
const inject = require("gulp-inject-string");

sass.compiler = require("node-sass");

gulp.task("js:concat", function () {
  return (
    gulp
      .src("./src/js/*.js")
      .pipe(concat("main.es.browser.js"))
      .pipe(strip())
      .pipe(gulp.dest("./dist/"))
  );
});

gulp.task("js:populate", function () {
  return (
    gulp
      .src("./dist/main.es.browser.js")
      .pipe(
        babel({
          presets: ["@babel/env"],
        })
      )
      .pipe(inject.after('"use strict";', "\n\nconst d3 = require('d3');\n\n"))
      .pipe(inject.append("\n\nmodule.exports = Blooom;"))
      .pipe(rename('main.js'))
      .pipe(gulp.dest("./dist/"))
  );
})

gulp.task("js:minify", function () {
  return gulp
    .src(["./dist/main.js", "./dist/main.es.browser.js"])
    .pipe(sourcemaps.init())
    .pipe(terser())
    .pipe(sourcemaps.write("./"))
    .pipe(
      rename(function (path) {
        if (!path.extname.endsWith(".map")) {
          path.basename += ".min";
        }
      })
    )
    .pipe(gulp.dest("./dist/"));
});

gulp.task("css:concat", function () {
  return gulp
    .src("./src/sass/*")
    .pipe(sass().on("error", sass.logError))
    .pipe(autoprefixer())
    .pipe(concat("main.css"))
    .pipe(gulp.dest("./dist/"));
});

gulp.task("css:minify", function () {
  return gulp
    .src("./dist/main.css")
    .pipe(
      uglifycss({
        uglyComments: true,
      })
    )
    .pipe(rename({ suffix: ".min" }))
    .pipe(gulp.dest("./dist/"));
});

gulp.task("css", gulp.series("css:concat", "css:minify"));
gulp.task("js", gulp.series("js:concat", "js:populate", "js:minify"));

gulp.task("build", gulp.parallel("css", "js"));

gulp.task("default", function () {
  gulp.watch("./src/sass/*", gulp.series("css"));
  gulp.watch("./src/js/*", gulp.series("js"));
});
