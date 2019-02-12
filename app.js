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
		delete playerObj[socket.id];
		io.sockets.emit('disconnect', socket.id);

	})

	socket.on('playerRegistered', function (data) {
		playerObj[socket.id] = data;	
		console.log(playerObj);

		var list = "";
		for (var key in playerObj) {
			list += `<li id="${key}">${playerObj[key]}</li>`;
		}
		console.log(list);
		io.sockets.emit('playerRegistered', list);
	})

	socket.on('startGame', function (data) {
		// console.log(data);
		io.sockets.emit('startGame', data);
	});

	socket.on('reactionSent', function (data) {
		if(Object.keys(actionObj).indexOf(socket.id) === -1) {
			actionObj[socket.id] = data;
			actionCounter++;
			console.log(Object.keys(playerObj).length);
		}
		if(actionCounter === Object.keys(playerObj).length) {
			actionCounter = 0;
			// console.log(actionObj);
			io.sockets.emit("reactionSent", actionObj);
			console.log("Round Over");
			determineWinner();
			actionObj = {};
			actionCounter = 0;
		}
	});

	function determineWinner () {
		var keysSorted = Object.keys(actionObj).sort(function(a,b){return actionObj[a]-actionObj[b]})
		io.sockets.emit('determineWinner', keysSorted);
		console.log(keysSorted);	
	};
});

