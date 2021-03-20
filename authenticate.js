const passport = require("passport")
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

const config = require('./config.js');

exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = function(user) {
    return jwt.sign(user, config.secretKey, {expiresIn: 3600});
};

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(
    new JwtStrategy(opts, (jwt_payload, done) => {
        console.log('jwt_payload: ', jwt_payload);
        User.findOne({ _id: jwt_payload._id }, (err, user) => {
            if (err) {
                return done(err, false); // done() is part of passport-jwt
            } else if (user) {
                return done(null, user);
            } else {
                return done(null, false); // no error but no "user" document found. Optional: prompt to create user login.
            }
        });
    })
)

exports.verifyAdmin = (req, res, next) => {
    if (req.user.admin) {
        return next();
    } else {
        err = new Error('You are not authorized to perform this operation.')
        err.status = 403; // unauthorized
        return next(err); 
    }
};

// "session: false" means we're not using sessions.
exports.verifyUser = passport.authenticate('jwt', {session: false});