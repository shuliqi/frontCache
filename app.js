const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const fs = require("fs");

const indexRouter = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// 静态资源缓存
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 1000 * 60 * 60}));
app.use('/', indexRouter);

// 静态文件1.css的缓存
app.get('/1.css', (req, res) => {
  const cssPath = path.join(__dirname, './public/stylesheets/1.css');
  fs.readFile(cssPath, (err, content) => {
    // 强缓存 ===> 头部设置缓存标记：全部的文件，10秒内使用本地的资源
    res.setHeader('Cache-Control', 'public, max-age=600');
    res.setHeader('Expires', 'Wed Dec 04 2019 23:35:42 GMT+0800');
    res.end(content)
  })
});

// 对比缓存
app.use('/1.js', (req, res) => {
  const jsPath = path.join(__dirname, './public/javascripts/1.js');
  fs.stat(jsPath, (err, stat) => {
    let lastModified = stat.atime.toUTCString();
   // 判断 if-modified-since 的时间与资源的最后修改时间是否一致
    if (req.headers['if-modified-since'] === lastModified) {
     // 如果时间一致， 则响应体是不需要的
      res.writeHead(304, 'not modified')
      res.end();
    } else {
      fs.readFile(jsPath, (err, content) => {
        res.setHeader('Last-Modified', lastModified);
        res.writeHead(200, 'ok');
        res.end(content);
      })
    }
  })
});




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
