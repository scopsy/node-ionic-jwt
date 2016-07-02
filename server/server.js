/**
 * Module dependencies.
 */
const express       = require('express');
const compression   = require('compression');
const bodyParser    = require('body-parser');
const logger        = require('morgan');
const errorHandler  = require('errorhandler');
const lusca         = require('lusca');
const dotenv        = require('dotenv');
const path          = require('path');
const mongoose      = require('mongoose');
const cors          = require('cors');

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.load({ path: '.env' });

/**
 * Load app modules and routes
 */
const AuthModule    = require('./config/AuthModule');
const TokenService  = require('./config/TokenService');
const authCtrl      = require('./controllers/auth.ctrl');

/**
 * Create Express server.
 */
const app = express();

/**
 * Connect to MongoDB.
 */
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on('error', () => {
    console.error('MongoDB Connection Error.');
    process.exit(1);
});

/**
 * Express configuration.
 */
app.set('port', process.env.PORT || 3000);
app.use(compression());
app.use(logger('dev'));
app.use(cors({
    origin: '*',
    withCredentials: false,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin' ]
}));

/**
 * Init body and cookie inside req
 * */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

/**
 * Token deserialization,
 * here we will check for token existence and extract the user payload
 * We will use the payload on other routes down the request pipeline
 */
app.use((req, res, next) => {
    const token = new TokenService(req.headers);
    
    req.isAuthenticated = token.isAuthenticated;
    req.tokenPayload    = token.getPayload();
    req.user            = {
        _id: req.tokenPayload._id
    };

    next();
});

app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.use(express.static(path.join(__dirname, 'public')));


/**
 * Endpoints.
 */
app.post('/auth/facebook',
    authCtrl.facebookAuth, authCtrl.retrieveUser, authCtrl.generateToken, (req, res) => {
    res.json({token: req.genertedToken});
});


app.use(errorHandler());

/**
 * Start Express server.
 */
app.listen(app.get('port'), () => {
    console.log(`Express server listening on port ${app.get('port')} in ${app.get('env')} mode`);
});

module.exports = app;
