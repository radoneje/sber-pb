var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var lessMiddleware = require('less-middleware');
var logger = require('morgan');
var config = require('./config.json')
var moment= require('moment');
var session = require('express-session')

var indexRouter = require('./routes/index');
var apiRouter = require('./routes/api');
var app = express();
var knex = require('knex')({
  client: 'pg',
  version: '7.2',
  connection:config.pgConnection,
  pool: { min: 0, max: 40 }
});
app.set('trust proxy', 1) // trust first proxy


const pgSession = require('connect-pg-simple')(session);
const pgStoreConfig = {conObject: config.pgConnection}
var sess={
  secret: (config.sha256Secret),


  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 10 * 24 * 60 * 60 * 1000,
    // secure: true,
    //httpOnly: true,
    //sameSite: 'none',
  }, // 10 days
  store:new pgSession(pgStoreConfig),
};


app.use(session(sess));


var counter=[];

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(lessMiddleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use("/", (req,res, next)=>{req.knex=knex;next();});
app.use("/", (req,res, next)=>{req.counter=counter;next();});
app.use('/', indexRouter);
app.use('/api', apiRouter);
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

clearCounter();
async function clearCounter(){

  var deleted=[];
  var lastCount=counter.length;
  counter.forEach(async (item)=>{
    var ret=((moment().unix())-item.date)<30
    if(!ret)
      deleted.push(item)
  });


  for(var item of deleted){
    console.log('deleted', item)
    await knex("t_sbpb_logouts").insert({
      userid:item.id,
      date: new Date(),
    })
  }
  if(deleted.length>0) {
    counter = counter.filter(function (el) {
      var find=deleted.filter(d=>{return d.id==el.id});
      return find.length<1;
    });
  }

  if(lastCount!=counter.length)
    await knex("t_sbpb_count").insert({count:counter.length, date:new Date()})
  setTimeout(()=>{clearCounter()}, 20*1000);
}

module.exports = app;
