const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const cors = require('cors');

const { addUser, removeUser, getUser, getUsersInRoom } = require('./users');

//define router
const router = require('./router');

//create instance of express
const app = express();

//initialize our server
const server = http.createServer(app);

//create instance of socketio
const io = socketio(server, {
    cors: {
        origin: '*',
    }
});

const port = process.env.PORT || 10000;




//call router as middleware
app.use(router);


//create a connection
io.on('connect', (socket) => {
    console.log('we have a new connection');

    //recieving data (name , room) from clent-side(chat.js)
    socket.on('join', ({ name, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, name, room });

        if(error) return callback(error);


        //if there is no error
        socket.join(user.room);

        //tellig user that he is welcomed to the chat
        socket.emit('message', { user: '👮', text: `${user.name}, welcome to room ${user.room}.`});

        //tellig everybody that a specific user has joined
        socket.broadcast.to(user.room).emit('message', { user: '👮', text: `🆕🆕 ${user.name} has joined! 🆕🆕` });
        
        io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });

        callback();
    });

    //creating event for user generated messages
    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);

        io.to(user.room).emit('message', { user: user.name, text: message });


        callback();
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        if (user) {
            io.to(user.room).emit('message', { user: '👮', text: `🚶 ${user.name} has left 🚶 ` });
            io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room)});

        }
    })
}) 



//listen to this app
server.listen(port, () => {
    console.log(`server listenning on port ${port}`);
}) 