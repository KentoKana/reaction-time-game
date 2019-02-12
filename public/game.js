const socket = io.connect("http://localhost:4000");
const messageDiv = document.getElementById('msg');
const startBtn = document.getElementById('startButton');
const reactBtn = document.getElementById('reactButton');
const playerListDisp = document.getElementById('playerList');
const resultsDisp = document.getElementById('displayResults');
let players;

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

function removeElement(elementId) {
    // Removes an element from the document.
    var element = document.getElementById(elementId);
    element.parentNode.removeChild(element);
}

const game = new Game(3, 5);

socket.on('connect', function () {
	var player = prompt('Please type in your display name');
	console.log(player);
	socket.emit('playerRegistered', player);
});

socket.on('disconnect', function (data) {
	console.log(data);
	removeElement(data.toString());
});

socket.on('playerRegistered', function (data) {
	players = data;
	playerListDisp.innerHTML = players;
});

startBtn.addEventListener('click', function () {
	socket.emit('startGame', game.genRandNum());
});

socket.on('startGame', function (data) {
	console.log(data);
	playerListDisp.innerHTML = players;
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
		const playerHTMLTag = document.getElementById(item);
		playerHTMLTag.innerHTML += `: ${data[item]}`;
		console.log(`${item}: ${data[item]}`);
	}
});

socket.on('determineWinner', function (data) {
	let string = '';
	for (i=0;i<data.length;i++) {
		string += `${i+1}. 	${document.getElementById(data[i]).innerHTML.split(':')[0]}<br>`;
	}
	resultsDisp.innerHTML = string;
})
