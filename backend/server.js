'use strict';
/**
 * Created by kinneretzin on 05/12/2016.
 */

const path = require('path');
const expressStaticGzip = require('express-static-gzip');
const express = require('express');
const passport = require('passport');
const cookieParser = require('cookie-parser');

const config = require('./config');
const Consts = require('./consts');

// Initialize log4js
let log4js = require('log4js');
let log4jsConfig = config.get().log4jsConfig;
let LoggerHandler = require('./handler/LoggerHandler');
LoggerHandler.init(log4jsConfig);

// Initialize the DB connection
let db = require('./db/Connection');

let getCookieStrategy = require('./routes/CookieStrategy');
let getTokenStrategy = require('./routes/TokenStrategy');
let getSamlStrategy = require('./routes/SamlStrategy');
let samlSetup = require('./samlSetup');

let AuthHandler = require('./handler/AuthHandler');
let Auth = require('./routes/Auth');

let ServerSettings = require('./serverSettings');
ServerSettings.init();

let ServerProxy = require('./routes/ServerProxy');
let UserApp = require('./routes/UserApp');
let Applications = require('./routes/Applications');
let BlueprintAdditions = require('./routes/BlueprintAdditions');
let Monitoring = require('./routes/Monitoring');
let clientConfig = require('./routes/ClientConfig');
let SourceBrowser = require('./routes/SourceBrowser');
let GitHub = require('./routes/GitHub');
let External = require('./routes/External');
let Style = require('./routes/Style');
let Widgets = require('./routes/Widgets');
let Templates = require('./routes/Templates');
let Tours = require('./routes/Tours');
let WidgetBackend = require('./routes/WidgetBackend');
let File = require('./routes/File');
let Plugins = require('./routes/Plugins');

let ToursHandler = require('./handler/ToursHandler');
let WidgetHandler = require('./handler/WidgetHandler');
let TemplateHandler = require('./handler/TemplateHandler');

let logger = log4js.getLogger('Server');

const contextPath = Consts.CONTEXT_PATH;
const oldContextPath = '/stage';

let app = express();

app.use(log4js.connectLogger(log4js.getLogger('http'), { level: 'INFO'}));

app.all('/', function (request, response){
    logger.info('Redirecting to "' + contextPath + '".');
    response.redirect(contextPath);
});

// For dev purposes
app.use(contextPath, (req,res,next) => {
    // Setting access control allow origin headers
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4000');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,authorization,authentication-token,tenant');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    next();
});

let samlConfig = config.get().app.saml;
if(samlConfig.enabled){
    samlSetup.validate(samlConfig);
    passport.use(getSamlStrategy());
}

passport.use(getTokenStrategy());
passport.use(getCookieStrategy());
app.use(cookieParser());
app.use(passport.initialize());

// Static Routes
app.use(contextPath + '/appData',
    passport.authenticate('cookie', { session: false }),
    expressStaticGzip(path.resolve(__dirname , '../dist/appData'), {enableBrotli: true, indexFromEmptyFile: false})
);

app.use(contextPath + '/userData',
    passport.authenticate('cookie', { session: false }),
    expressStaticGzip(path.resolve(__dirname , '../dist/userData'), {enableBrotli: true, indexFromEmptyFile: false})
);

app.use(contextPath,
    expressStaticGzip(path.resolve(__dirname , '../dist'), {enableBrotli: true, indexFromEmptyFile: false}));


// API Routes
app.use(contextPath + '/sp',ServerProxy);
app.use(contextPath + '/auth',Auth);
app.use(contextPath + '/ua',UserApp);
app.use(contextPath + '/applications',Applications);
app.use(contextPath + '/source',SourceBrowser);
app.use(contextPath + '/ba',BlueprintAdditions);
app.use(contextPath + '/monitor',Monitoring);
app.use(contextPath + '/style',Style);
app.use(contextPath + '/widgets',Widgets);
app.use(contextPath + '/templates',Templates);
app.use(contextPath + '/tours',Tours);
app.use(contextPath + '/clientConfig',clientConfig);
app.use(contextPath + '/github',GitHub);
app.use(contextPath + '/external',External);
app.use(contextPath + '/file',File);
app.use(contextPath + '/config',function(req,res){
    res.send(config.getForClient(ServerSettings.settings.mode));
});
app.use(contextPath +'/wb',WidgetBackend);
app.use(contextPath +'/plugins',Plugins);

// Redirect URLs with old context path (/stage)
app.use([oldContextPath, `${oldContextPath}/*`], function (request, response){
    let pathWithoutOldContextPath = request.originalUrl.replace(new RegExp('^' + oldContextPath), '');
    let redirectUrl = `${contextPath}${pathWithoutOldContextPath}`;
    logger.info('Old base url detected: "' + request.originalUrl + '". Redirecting to "' + redirectUrl + '".');

    response.redirect(redirectUrl);
});

// BrowserHistory code
app.get('*',function (request, response){
    logger.info('URL: "' + request.originalUrl + '". Sending index.html file.');
    response.sendFile(path.resolve(__dirname, '../dist', 'index.html'));
});

// Initialize authorization data (fetch from manager)
AuthHandler.initAuthorization().then(function(){
    ToursHandler.init().then(function(){
        // Only after we have all the data in place start the server
        app.listen(8088, function () {
            logger.info('Server started in mode '+ServerSettings.settings.mode);
            if (process.env.NODE_ENV === 'development') {
                logger.info('Server started for development');
            }
            logger.info('Stage runs on port 8088!');
        });
    });
});

//Error handling
app.use(function(err, req, res, next) {
    logger.error('Error has occured ', err);

    let message = err.message;
    if (err.status === 500) {
        message = 'The server is temporarily unavailable';
    }

    res.status(err.status || 404).send({message: message || err});
});

WidgetHandler.init();
TemplateHandler.init();