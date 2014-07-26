require('dotenv').load();

var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var ig = require('instagram-node').instagram();

ig.use({ access_token: process.env.IG_ACCESS_TOKEN });
ig.use({ client_id: process.env.CLIENT_ID,
         client_secret: process.env.CLIENT_SECRET });

var totalImages = [];

var handler = function(err, medias, pagination, limit) {
    medias.forEach(function(image) {
        totalImages.push({id: image.id,likes: image.likes.count, link:image.link,
            username: image.user.username});
    });

    if(pagination.next) {
        pagination.next(handler);
    } else {
        totalImages.sort(function(a, b) {
            if (a.likes > b.likes) {
                return -1;
            } else if (a.likes < b.likes) {
                return 1;
            } else {
                return 0;
            }
        });
        console.log(totalImages);
        for(var i = 10; i > 0; i--) {
            console.log(totalImages[i]);
        }
        console.log(Object.keys(totalImages).length);
    }
};

ig.tag_media_recent('frontinbh', handler);

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);



/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
