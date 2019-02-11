const express = require('express'),
socket = require('socket.io'),
app = express(),
port = 4000;

const server = app.listen(port, function () {
	console.log("App listening on Port" + port);
});

const io = socket(server);

app.use(express.static("public"));

let socketCount = 0; 

let actionCounter = 0;
let playerObj = {};
let actionObj = {};


io.on('connection', function (socket) {
	console.log("Socket connected!", socket.id);
	socketCount++;
	console.log("socket count =" + socketCount);

	socket.on('disconnect', function () {
		socketCount--;
		console.log("socket count=" + socketCount);
		console.log('User Disconnected.');
	})

	socket.on('playerRegistered', function (data) {
		playerObj[socket.id] = data;	
		console.log(playerObj);
		io.sockets.emit('playerRegistered', playerObj);
	})

	socket.on('startGame', function (data) {
		console.log(data);
		io.sockets.emit('startGame', data);
	});

	socket.on('reactionSent', function (data) {
		if(Object.keys(actionObj).indexOf(socket.id) === -1) {
			actionObj[socket.id] = data;
			actionCounter++;
			console.log(Object.keys(playerObj).length);
			console.log(data);
		}
		if(actionCounter === Object.keys(playerObj).length) {
			actionCounter = 0;
			io.sockets.emit("reactionSent", actionObj);
			console.log("Round Over");
			actionObj = {};
			actionCounter = 0;
		}
	});
});