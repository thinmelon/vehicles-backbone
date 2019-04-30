const createError = require('http-errors');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
// const lessMiddleware = require('less-middleware');
// const logger = require('morgan');

const vehiclesRouter = require('./routes/vehicles.route');
const platformRouter = require('./routes/platform.route');
const loginService = require('./services/login.service');

const app = express();

/**
 *  view engine setup
 */
app.set('views', path.join(__dirname, 'views'));
/**
 *  A template engine enables you to use static template files in your application.
 */
app.set('view engine', 'pug');
/**
 *
 *          app.use([path,] callback [, callback...])
 *
 * Mounts the specified middleware function or functions at the specified path:
 * The middleware function is executed when the base of the requested path matches path.
 */
/**
 * Since path defaults to “/”, middleware mounted without a path will be executed for every request to the app.
 * For example, this middleware function will be executed for every request to the app
 */
app.use(function (req, res, next) {
    //  解决跨域请求的问题
    res.header('Access-Control-Allow-Origin', '*');                                                 //  允许哪个源可以来访问
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');                  //  允许哪种类型的方法可以来访问
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');   //  允许哪种类型的头可以访问
    //  res.header('Access-Control-Allow-Credentials','true');                                      //  允许携带 cookie
    next();
});
/**
 *          body-parser
 *
 * Parse incoming request bodies in a middleware before your handlers, available under the req.body property.
 * The bodyParser object exposes various factories to create middlewares.
 * All middlewares will populate the req.body property with the parsed body when the Content-Type request header matches the type option,
 * or an empty object ({}) if there was no body to parse, the Content-Type was not matched, or an error occurred.
 *
 *          bodyParser.json([options])
 *
 * Returns middleware that only parses json and only looks at requests where the Content-Type header matches the type option.
 *
 *          bodyParser.raw([options])
 *
 * Returns middleware that parses all bodies as a Buffer
 *
 *          bodyParser.text([options])
 *
 * Returns middleware that parses all bodies as a string
 *
 *          bodyParser.urlencoded([options])
 *
 * Returns middleware that only parses urlencoded bodies
 */
require('body-parser-xml')(bodyParser);
app.use(bodyParser.xml({            // 用于解析微信等第三方服务器返回XML格式的通知
    limit: '1MB',                   // Reject payload bigger than 1 MB
    xmlParseOptions: {
        normalize: true,            // Trim whitespace inside text nodes
        normalizeTags: true,        // Transform tags to lowercase
        explicitArray: false        // Only put nodes in array if >1
    }
}));
app.use(bodyParser.json());                                // parse application/json
app.use(bodyParser.urlencoded({extended: false}));        // parse application/x-www-form-urlencoded
app.use(bodyParser.text({type: 'text/html'}));             // parse an HTML body into a string
/**
 *          cookie-parser
 *
 * Parse Cookie header and populate req.cookies with an object keyed by the cookie names.
 */
app.use(cookieParser());
/**
 *          express.static
 *
 * It serves static files and is based on serve-static.
 * To serve static files such as images, CSS files, and JavaScript files, use the express.static built-in middleware function.
 * --    app.use(express.static('public'))  // Now, you can load the files that are in the public directory:
 * Or specify a mount path for the static directory, as shown below:
 * --    app.use('/static', express.static('public'))
 * If you run the express app from another directory, it’s safer to use the absolute path of the directory that you want to serve:
 * --    app.use('/static', express.static(path.join(__dirname, 'public')))
 */
// app.use(lessMiddleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
/**
 * Middleware functions are executed sequentially, therefore the order of middleware inclusion is important.
 */
app.use('/platform', platformRouter);
app.use(loginService.authorize);                //  登录服务
app.use('/vehicles', vehiclesRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
