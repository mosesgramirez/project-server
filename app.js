const createError = require('http-errors');
const express = require('express');
const path = require('path');
// const cookieParser = require('cookie-parser'); express-session implements cookies
const logger = require('morgan');
const responseTime = require('response-time');
const session = require('express-session');
const fileStore = require('session-file-store')(session);

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const campsiteRouter = require('./routes/campsiteRouter');
const promotionRouter = require('./routes/promotionRouter');
const partnerRouter = require('./routes/partnerRouter');

const mongoose = require('mongoose');
const url = 'mongodb://localhost:27017/mucampsite';
const connect = mongoose.connect(url, {
  useCreateIndex: true,
  useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true
});

connect.then(() => console.log('Connected correctly to server'), 
  err => console.log(err)
); // 2nd argument for error handling, alternative to .catch() 

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(responseTime());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser('12345-67890-09876-54321'));

app.use(session({
  name: 'session-id',
  secret: '12345-67890-09876-54321',
  saveUninitialized: false,
  resave: false, // example settings
  store: new fileStore()
}));

function auth(req, res, next) {
  console.log(req.session)
  if (!req.session.user) {
    // console.log('This is req.headers: ', req.headers);
    const authHeader = req.headers.authorization;
    // console.log('This is authHeader: ',authHeader);
    // console.log(typeof authHeader);
    if (!authHeader) {
        const err = new Error('You are not authenticated.');
        res.setHeader('WWW-Authenticate', 'Basic');
        err.status = 401; // unauthorized
        return next(err);
    }
    
    // for my info
    // const testAuth = Buffer.from(authHeader.split(' ')[1], 'base64');
    // console.log('This is testAuth: ', testAuth);
    // const testAuth2 = Buffer.from(authHeader.split(' ')[1], 'base64').toString();
    // console.log('This is testAuth2: ', testAuth2);
    
    const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    // console.log('This is auth: ', auth)
    const user = auth[0];
    const pass = auth[1];
    if (user === 'admin' && pass === 'password') {
      req.session.user = 'admin' // 
      return next(); // authorization successful
    } else {
        const err = new Error('You are not authenticated!');
        res.setHeader('WWW-Authenticate', 'Basic');      
        err.status = 401;
        return next(err);
    }
  } else {
    if (req.session.user === "admin") {
      return next();
    } else {
      const err = new Error('You are not authenticated!');
      err.status = 401;
      return next(err);
    }
  }
} 

app.use(auth);
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/campsites', campsiteRouter);
app.use('/promotions', promotionRouter);
app.use('/partners', partnerRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
