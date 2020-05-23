const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = socketio(server)
const formatMessage = require('./utils/messages.js');
const {userJoin, getCurrentUser,userLeave,getRoomUsers} = require('./utils/users.js');


const botName = 'Admin'

app.use(express.static(path.join(__dirname,'/public')));
io.on('connection', socket => {

	socket.on('joinRoom', ({username,room}) => {
		const user = userJoin(socket.id,username,room);
		socket.join(user.room);

		//Welcome current user 
		socket.emit('message', formatMessage(botName,'Welcome to ChatCord'));

		//BroadCast When a user connects
		socket.broadcast.to(user.room).emit('message',formatMessage(botName,`${user.username} has joined the chat`));

		io.to(user.room).emit('roomusers',{
			room : user.room, 
			users : getRoomUsers(user.room)
		});
	})
	

	//Broadcast disconnect image
	socket.on('disconnect',message => {
		const user = userLeave(socket.id);
		if(user){
			io.to(user.room).emit('message', formatMessage(botName,`${user.username} left the chat`));	
			io.to(user.room).emit('roomusers',{
				room : user.room, 
				users : getRoomUsers(user.room)
			});

		}
		
	})

	//Listen for chatMessage
	socket.on('chatMessage', msg => {
		const user = getCurrentUser(socket.id);
		io.to(user.room).emit('message',formatMessage(user.username,msg));
		
	})
})
const PORT = 3000 || process.env.PORT
server.listen(PORT, () => console.log(`Running on PORT ${PORT}`));