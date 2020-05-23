const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');



//Get username and room from queryparams
const {username, room} = Qs.parse(location.search,{
	ignoreQueryPrefix:true
})



var socket = io();
socket.on('message', message => {
	outputMessage(message);
	chatMessages.scrollTop = chatMessages.scrollHeight;
});

socket.emit('joinRoom',{username,room});

socket.on('roomusers',({room,users}) => {
	console.log(room);
	console.log(users);
	outputRoomName(room);
	outputUsers(users);
})


chatForm.addEventListener('submit', (e) => {
	e.preventDefault();
	const msg = e.target.elements.msg.value;

	//Emitting a message to Server
	socket.emit('chatMessage',msg);

	//Clear our input
	e.target.elements.msg.value = '';
	e.target.elements.msg.focus();
})



function outputMessage(message){
	const div = document.createElement('div');
	div.classList.add('message');
	div.innerHTML = `
		<p class="meta">${message.username} <span>${message.time}</span></p>
		<p class="text">
			${message.text}
		</p>
	`;

	document.querySelector('.chat-messages').appendChild(div);
}

function outputRoomName(room){
	roomName.innerText = room;
}

function outputUsers(users){
	userList.innerHTML = `
		${users.map(user => `<li> ${user.username}</li>`).join('')}
	`;
}