var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);

io.on('connection', function(socket){
    console.log('a user connected');
    socket.on('disconnect', function(msg){
        console.log('user disconnected');
    });

    socket.on('joinRoom', function(msg){
        console.log(msg.name + ' joined ' + msg.room)
        socket.user = msg;
        socket.join(msg.room);
        if(Object.keys(io.sockets.connected).length > 1) {
            var clients_in_the_room = io.sockets.adapter.rooms[msg.room];
            for (var clientId in clients_in_the_room) {
                if(clientId != socket.id){
                    var client_socket = io.sockets.connected[clientId];//Do whatever you want with this
                    client_socket.emit('syncClient', {clientId:socket.id})
                    break;
                }
            }
        }
    });

    socket.on('syncClient', function(msg){
        io.sockets.connected[msg.clientId].emit('updateCanvas', {canvas:msg.canvas});
    })

    addListener('addObject');
    addListener('writing');
    addListener('scaling');
    addListener('rotating');
    addListener('moving');

    function addListener(name){
        socket.on(name, function(msg){
            var user = socket.user;
            if(user) {
                socket.broadcast.to(user.room).emit(name, msg);
            }
        });
    };
});



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

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

var debug = require('debug')('notewithme');
//var app = require('../app');

app.set('port', process.env.PORT || 3000);

var server = http.listen(app.get('port'), function() {
    debug('Express server listening on port ' + server.address().port);
});


module.exports = app;
