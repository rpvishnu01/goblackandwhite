const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const hbs = require('express-handlebars');
const session = require('express-session')
const nocache = require("nocache");






var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');

var app = express();
app.use(nocache());
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.engine('hbs', hbs.engine({
  extname: 'hbs', defaultLayout: 'layout',
  layoutsDir: __dirname + '/views/layout', partialsDir: __dirname + '/views/partials',
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));





// this is inside session({}) ->resave:false,saveUninitialized:true
app.use(session({ secret: "key", cookie: { maxAge: 6000000 } }))


// const io = require('socket.io')(http)
// io.on('connection', (socket) => {
//   console.log("io connected")
// })

app.use('/', userRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  // console.log(req.body);
  // next(createError(404));
  res.render('user/404')
});

// error handler
app.use(function (err, req, res, next) {
  console.log("bsfdasfas",err);
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  // res.render('error');
  res.render('user/500')
});













module.exports = app;
