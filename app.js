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
io.on('connection', function (socket) {
    console.log('a user connected');
    socket.on('disconnect', function (msg) {
        var userName = "John Doe";
        if(socket.user){
            userName = socket.user.name;
            socket.broadcast.to(getRoom(socket.user)).emit('messageChannel', messageForChannel('User disconneted!', userName + ' left the room.'));
        }
        console.log(userName + ' disconnected');

    });
    socket.on('joinRoom', function (msg) {
        console.log(msg.name + ' joined ' + getRoom(msg));
        socket.user = msg;
        socket.join(getRoom(msg));
        var clientsConnected = Object.keys(io.sockets.connected).length;

        if (clientsConnected == 1) {
            checkIfHasExistingCanvasAndUpdateCanvas();
        } else if (clientsConnected > 1) {
            findFirstClientAndAskForSync();
        }

        function checkIfHasExistingCanvasAndUpdateCanvas() {
            var redisClient = redis.createClient();
            var room = getRoom(msg);
            redisClient.get(room, function (err, canvas) {
                if (canvas != '') {
                    console.log("Getting saved canvas:  " + room);
                    sendMessageToAllIn(room).emit('updateCanvas', {canvas: canvas});
                }
            })
        }

        function findFirstClientAndAskForSync() {
            var clients_in_the_room = io.sockets.adapter.rooms[getRoom(msg)];
            for (var clientId in clients_in_the_room) {
                if (clientId != socket.id) {
                    var client_socket = io.sockets.connected[clientId];
                    client_socket.emit('syncClient', {clientId: socket.id})
                    break;
                }
            }
        }

        sendToAllInRoomButMe(getRoom(socket.user)).emit('messageChannel', messageForChannel('New user!', socket.user.name + ' joined.'));
    });

    function messageForChannel(status, message){
        return {status:status, message:message};
    }
    socket.on('syncClient', function (msg) {
        io.sockets.connected[msg.clientId].emit('updateCanvas', {canvas: msg.canvas});
    })
    function sendMessageToAllIn(room) {
        return io.sockets.in(room);
    }


    function sendToAllInRoomButMe(room) {
        return socket.broadcast.to(room);
    }
    socket.on('saveCanvas', function (msg) {
        var redisClient = redis.createClient();
        var room = getRoom(msg);
        redisClient.set(room, msg.canvas, redis.print);
        console.log("Saving: " + room);
        sendMessageToAllIn(room).emit('messageChannel', messageForChannel('Success.', 'Canvas saved.'));
    })

    socket.on('messageChannel', function(msg){
        sendMessageToAllIn(room).emit('messageChannel', msg);
    });

    addListener('addObject');
    addListener('removeObject');
    addListener('writing');
    addListener('scaling');
    addListener('rotating');
    addListener('moving');


    function addListener(name) {
        socket.on(name, function (msg) {
            var user = socket.user;
            if (user) {
                sendToAllInRoomButMe(getRoom(user)).emit(name, msg);
            }
        });
    };
    function getRoom(user) {
        return user.randomString + "/" + user.room;
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
var server = http.listen(app.get('port'), function () {
    debug('Express server listening on port ' + server.address().port);
});
module.exports = app;
