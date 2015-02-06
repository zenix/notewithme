var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var redis = require("redis");

var app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);

io.on('connection', function(socket){
    console.log('a user connected');
    socket.on('disconnect', function(msg){
        console.log('user disconnected');
    });

    socket.on('joinRoom', function(msg){
        console.log(msg.name + ' joined ' + getRoom(msg));
        socket.user = msg;
        socket.join(getRoom(msg));
        var clientsConnected = Object.keys(io.sockets.connected).length;
        if(clientsConnected > 1) {
            var clients_in_the_room = io.sockets.adapter.rooms[getRoom(msg)];
            for (var clientId in clients_in_the_room) {
                if(clientId != socket.id){
                    var client_socket = io.sockets.connected[clientId];
                    client_socket.emit('syncClient', {clientId:socket.id})
                    break;
                }
            }
        }else if(clientsConnected == 1){
            var redisClient = redis.createClient();
            var room = getRoom(msg);
            redisClient.get(room, function(err, canvas){
                console.log("Getting saved canvas:  " + room);
                io.sockets.in(room).emit('updateCanvas', {canvas:canvas});
            })
        }
    });

    socket.on('syncClient', function(msg){
        io.sockets.connected[msg.clientId].emit('updateCanvas', {canvas:msg.canvas});
    })

    socket.on('saveCanvas', function(msg){
        var redisClient = redis.createClient();
        var room = getRoom(msg);
        redisClient.set(room, msg.canvas, redis.print);
        console.log("saving.. " + room);
    })

    addListener('addObject');
    addListener('removeObject');
    addListener('writing');
    addListener('scaling');
    addListener('rotating');
    addListener('moving');

    function addListener(name){
        socket.on(name, function(msg){
            var user = socket.user;
            if(user) {
                socket.broadcast.to(getRoom(user)).emit(name, msg);
            }
        });
    };

    function getRoom(user){
        return user.randomString + "/" + user.title;
    }
});



// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));

app.use(express.static(__dirname + '/public_html'));

app.use("*", function (req, res) {
    res.sendFile(__dirname + '/public_html/index.html');
});


// TODO: error handlers

var debug = require('debug')('notewithme');
//var app = require('../app');

app.set('port', process.env.PORT || 3000);

var server = http.listen(app.get('port'), function() {
    debug('Express server listening on port ' + server.address().port);
});


module.exports = app;
