const { src, dest, watch, parallel, series, lastRun } = require("gulp")
const autoprefixer = require("gulp-autoprefixer")
const gulpSass = require("gulp-sass")
const connect = require("gulp-connect")
const fibers = require("fibers")
const gulpStylelint = require("gulp-stylelint")

gulpSass.compiler = require("sass")

const paths = {
    "scss": "src/assets/scss/**/*.scss",
    "css": "src/assets/css/",
    "html": "src/**/*.html",
    "webroot": "src/",
}

const stylelint = () => {
    return src(paths.scss, {
        since: lastRun(stylelint)
    })
    .pipe(gulpStylelint({
        failAfterError: false,
        reporters: [{
            formatter: "string",
            console: true
        }],
        syntax: "scss",
        fix: true,
    }))
    .pipe(dest(paths.webroot + "assets/scss"))
}

const sass = () => {
    return src(paths.scss, {
        sourcemaps: true
    })
    .pipe(
        gulpSass({
            fiber: fibers,
            outputStyle: "compressed",
        })
        .on("error", gulpSass.logError)
    )
    .pipe(
        autoprefixer({
            grid: true,
        })
    )
    .pipe(
        dest(paths.css, {
            sourcemaps: ".",
        })
    )
    .pipe(connect.reload())
}

const html = () => {
    return src(paths.html)
    .pipe(connect.reload())
}

const watcher = (cb) => {
    watch(paths.scss, sass)
    watch(paths.html, html)
    cb()
}

const server = (cb) => {
    connect.server({
        root: paths.webroot,
        livereload: true
    })
    cb()
}


exports.stylelint = stylelint
exports.compile = series(stylelint, sass)
exports.default = parallel(server, watcher)
