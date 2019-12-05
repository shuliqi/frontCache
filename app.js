
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const fs = require("fs");
const md5 = require('md5');

const indexRouter = require('./routes/index');

const app = express();

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

// 强缓存---> Expires
app.get('/1.css', (req, res) => {
  const cssPath = path.join(__dirname, './public/stylesheets/1.css');
  // 读取1.css 文件
  fs.readFile(cssPath, (err, content) => {
    if(!err) {
      // 设置到期时间
      res.setHeader('Expires', 'Thu Dec 05 2019 23:51:08 GMT+0800 (CST)');
      // 发送1.css文件buffer
      res.end(content);
    }
  });
});

// 强缓存---> Cache-Control
app.get('/2.css', (req, res) => {
  const cssPath = path.join(__dirname, './public/stylesheets/2.css');
  fs.readFile(cssPath, (err, content) => {
    // 设置到期时间，全部资源， 10秒请求使用本地资源
    res.setHeader('Cache-Control', 'public, max-age=600');
    // 发送2.css文件buffer
    res.end(content);
  });
});

// 对比缓存 [if-modified-since, Last-Modified, ]
app.use('/1.js', (req, res) => {
  const jsPath = path.join(__dirname, './public/javascripts/1.js');

  // 获取文件1.js的信息
  fs.stat(jsPath, (err, stat) => {
    // 获取文件内容被修改的时间 modify time
    let lastModified = stat.mtime.toUTCString();
   // 判断 if-modified-since 的时间与资源的最后修改时间是否一致
    if (req.headers['if-modified-since'] === lastModified) {
      // 设置响应状态码
      res.writeHead(304, 'not modified');
     // 响应体为空，减少传输时间
      res.end();
    } else {
      // 读取文件
      fs.readFile(jsPath, (err, content) => {
        // 设置Last-Modified
        res.setHeader('Last-Modified', lastModified);
        // 设置响应状态码
        res.writeHead(200, 'ok');
        // 响应体为空，减少传输时间
        res.end(content);
      })
    }
  })
});


// 对比缓存 [ Etag, If-None-Match ]
app.get('/2.js', (req, res) => {
  const jsPath = path.join(__dirname, './public/javascripts/2.js');
  // 读取文件
  fs.readFile(jsPath, (err, content) => {
    // 对文件内容使用md5加密形成一个唯一的标识
    let etag = md5(content);
    // 请求头的唯一标识和当前文件的唯一标识是一致的，标识文件没有被修改过
    if (req.headers['if-none-match'] === etag) {
      // 设置响应头 304
      res.writeHead(304, 'not modified');
      // 响应体为空，减少传输时间
      res.end();
    } else {
      // 设置响应头的Etag
      res.setHeader('Etag', etag);
       // 设置响应头 200
      res.writeHead(200, 'ok');
      // 需要返回内容
      res.end(content);
    }
  })
});


// 刷新/访问行为
app.get('/1.png', (req, res) => {
  // 设置到期时间
  res.setHeader('Expires', 'Thu Dec 05 2019 23:51:08 GMT+0800 (CST)');
  res.setHeader('Cache-Control', 'public, max-age=6000');

  const imgPath = path.join(__dirname, './public/images/1.png');
  // 获取文件1.png的信息
  fs.stat(imgPath, (err, stat) => {
    // 获取文件内容被修改的时间 modify time
    let lastModified = stat.mtime.toUTCString();
   // 判断 if-modified-since 的时间与资源的最后修改时间是否一致
    if (req.headers['if-modified-since'] === lastModified) {
      // 设置响应状态码
      res.writeHead(304, 'not modified');
     // 响应体为空，减少传输时间
      res.end();
    } else {
      // 读取文件
      fs.readFile(imgPath, (err, content) => {
        // 设置Last-Modified
        res.setHeader('Last-Modified', lastModified);
        // 设置响应状态码
        res.writeHead(200, 'ok');
        // 响应体为空，减少传输时间
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
