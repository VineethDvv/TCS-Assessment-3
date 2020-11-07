var PORT = process.env.PORT || 8000;
var moment = require('moment');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var jsdom = require("jsdom");
var JSDOM = jsdom.JSDOM;
//global.document = new JSDOM(html).window.document;


// const fastcsv = require("fast-csv");
// const fs = require("fs");
// const ws = fs.createWriteStream("bezkoder_mongodb_fastcsv.csv");

const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://vineeth:vineeth123@tcs.t1oqs.mongodb.net/tcsdb?retryWrites=true&w=majority";
var collection;

const client = new MongoClient(uri, { useUnifiedTopology: true });

client.connect(err => {
    collection = client.db("tcsdb").collection("testdb");
    console.log('connected')
})

app.use(express.static(__dirname + '/public'));

var clientInfo = {};

// Sends current users to provided socket
function sendCurrentUsers (socket) {
	var info = clientInfo[socket.id];
	var users = [];

	if (typeof info === 'undefined') {
		return;
	}

	Object.keys(clientInfo).forEach(function (socketId) {
		var userInfo = clientInfo[socketId];

		if (info.room === userInfo.room) {
			users.push(userInfo.name);
		}
	});

	socket.emit('message', {
		name: 'System',
		text: 'Current users: ' + users.join(', '),
		timestamp: moment().valueOf()
	});
}

io.on('connection', function (socket) {
	console.log('User connected via socket.io!');

	socket.on('disconnect', function () {
		var userData = clientInfo[socket.id];

		if (typeof userData !== 'undefined') {
			socket.leave(userData.room);
			io.to(userData.room).emit('message', {
				name: 'System',
				text: userData.name + ' has left!',
				timestamp: moment().valueOf()
			});
			delete clientInfo[socket.id];
		}
		
		collection.insertOne({Update:userData.name+" has left from the conversation"})
		collection.find().toArray().then(result=>{
			document.getElementById("textbox").src = result;
		})

	

	});

	socket.on('joinRoom', function (req) {
		clientInfo[socket.id] = req;
		socket.join(req.room);
		socket.broadcast.to(req.room).emit('message', {
			name: 'System',
			text: req.name + ' has joined!',
			timestamp: moment().valueOf()
		});
		
		collection.insertOne({Update:req.name+" has joined the conversation"})
		collection.find().toArray().then(result=>{
			document.getElementById("textbox").src = result;
		})

	});

	socket.on('message', function (message) {
		console.log('Message received: ' + message.text);

		if (message.text === '@currentUsers') {
			sendCurrentUsers(socket);
		} else {
			message.timestamp = moment().valueOf();
			io.to(clientInfo[socket.id].room).emit('message', message);	

				collection.insertOne(message).then(result=>{
				console.log("Message is added to the database")
			})

			collection.insertOne(message).then(result=>{

			})
			collection.find().toArray().then(result=>{
				document.getElementById("textbox").src = result;
			})
			

		}
	});

	// timestamp property - JavaScript timestamp (milliseconds)

	socket.emit('message', {
		name: 'System',
		text: 'Welcome to the chat application!',
		timestamp: moment().valueOf()
	});
});

http.listen(PORT, function () {
	console.log('Server started!');
});

