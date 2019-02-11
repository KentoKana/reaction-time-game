const socket = io.connect("http://localhost:4000");
const messageDiv = document.getElementById('msg');
const startBtn = document.getElementById('startButton');
const reactBtn = document.getElementById('reactButton');
const playerListDisp = document.getElementById('playerList');

function Game(min, max) {
	this.min = min;
	this.max = max;
	this.setTimeout;
	this.promptMsg = "REACT NOW!";
	this.timeArr = [];
	this.setTimeout;

	this.genRandNum = function () {
		return Math.floor(Math.random() * (this.max - this.min + 1) + this.min);
	};

	this.startTime = function () {
		this.timeArr.push (Date.now());
		console.log(this.timeArr);
	};

	this.stopTime = function () {
		this.timeArr.push (Date.now());
	};

	this.promptReaction = function () {
		messageDiv.innerHTML = this.promptMsg;
		this.startTime();
	};

	this.resetGame = function () {
		clearTimeout(this.setTimeout);
	};
}

const game = new Game(3, 5);

socket.on('connect', function () {
	var player = prompt('Please type in your display name');
	socket.emit('playerRegistered', player);
});

socket.on('playerRegistered', function (data) {
	var list = "";
	for (var key in data) {
		list += `<li id="${key}">${data[key]}</li>`;
	}
	playerListDisp.innerHTML = list;
});

startBtn.addEventListener('click', function () {
	socket.emit('startGame', game.genRandNum());
});

socket.on('startGame', function (data) {
	console.log(data);
	messageDiv.innerHTML = `Wait ${data} seconds.`;
	game.setTimeout = setTimeout( ()=> game.promptReaction(), data * 1000);
	startBtn.setAttribute('disabled', '');
	reactBtn.removeAttribute('disabled');
});

reactBtn.addEventListener('click', function () {
	messageDiv.innerHTML = '';
	game.stopTime();
	let calcTime = game.timeArr[1] - game.timeArr[0];
	socket.emit('reactionSent', calcTime);
	startBtn.removeAttribute('disabled');
	reactBtn.setAttribute('disabled', '');

	console.log(calcTime);
	game.timeArr = [];
});

socket.on('reactionSent', function (data) {
	for (var item in data) {
		const playerOnList = document.getElementById(item);
		playerOnList.innerHTML += `: ${data[item]}`;
		console.log(`${item}: ${data[item]}`);
	}
});
