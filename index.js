const express = require('express'),
    app = express(),
    fs = require('fs'),
    _ = require('lodash'),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    ai = require('./ai'),
    room = require('./room'), rooms = [];

app.use(express.static(__dirname + '/static'));

app.get('/', (req, res, next) => {
    res.sendFile(__dirname + '/static/index.html');
});
app.get('/game.html', (req, res) => {
    res.sendFile(__dirname + '/static/game.html');
});

io.on('connection', function (socket) {
    console.log('user connected');
    socket.on('game', (data) => {
        console.log('game req');
        if (data.mode == 'multi') {
            if (rooms.length == 0 || rooms[rooms.length - 1].roomCheck() == 2) {
                rooms.push(new room(rooms.length.toString()));
            }
            let lastRoom = rooms[rooms.length - 1];
            console.log('it is multi');
            if (lastRoom.roomCheck() == 0) {
                lastRoom.firstPlayer = data.name;
                lastRoom.firstPlayer.socket = socket;
                socket.join(lastRoom.name);
                console.log('firstPlayer are there');
                socket.emit('waitG');
            } else {
                lastRoom.lastPlayer = data.name;
                lastRoom.lastPlayer.socket = socket;
                socket.join(lastRoom.name);
                console.log('lastPlayer are there');
                let player = { p1: lastRoom.firstPlayer.number, p2: lastRoom.lastPlayer.number };
                io.to(lastRoom.name).emit('startG', player);
            }
        } else {
            console.log('single mode');
            let thisRoom = new room(rooms.length.toString());
            socket.join(thisRoom.name);
            rooms.push(thisRoom);
            thisRoom.lastPlayer.name = data.name;
            thisRoom.lastPlayer.socket = socket;
            let bot = new ai(thisRoom.firstPlayer.number);
            thisRoom.firstPlayer.name = bot.name;
            thisRoom.firstPlayer.socket = bot;
            thisRoom.lastPlayer.socket.emit('startG', { p1: thisRoom.firstPlayer.number, p2: thisRoom.lastPlayer.number });
            if(thisRoom.firstPlayer.number == 0){
                setTimeout(()=>{                
                let moved = thisRoom.firstPlayer.socket.move(thisRoom.xo);
                let resultBot = thisRoom.fill(moved.i, moved.j, thisRoom.firstPlayer.socket.name);
                status(socket, thisRoom, resultBot, moved.i, moved.j);
                },8*1000);
            }
        }
    })

    socket.on('btn', (btn) => {
        let thisRoom = rooms[parseInt(Object.keys(socket.rooms)[0])];
        let result = thisRoom.fill(btn.i, btn.j, btn.name);
        status(socket, thisRoom, result, btn.i, btn.j);
        if(thisRoom.firstPlayer.socket.name)
        {
            let moved = thisRoom.firstPlayer.socket.move(thisRoom.xo);
            let resultBot = thisRoom.fill(moved.i, moved.j, thisRoom.firstPlayer.socket.name);
            status(socket, thisRoom, resultBot, moved.i, moved.j);
        }
    })

    socket.on('disconnecting',(data)=>{
        let thisRoom = rooms[parseInt(Object.keys(socket.rooms)[0])];
        if(!thisRoom){
            console.log('disconnected');
            return;
        }
        console.log(thisRoom);
        socket.leave(thisRoom.name);
        io.to(thisRoom.name).emit('dis');
    })
});
http.listen(4000, function () {
    console.log('listening on *:4000');
});

function toFile(winner){
    let address = './players/' + winner + '.json';
    let score;
    try {
        score = JSON.parse(fs.readFileSync(address).toString());
    }
    catch (e) {
        console.log(e);
        fs.writeFileSync(address, '');
        score = { name : winner ,score: 0 };
    }
    score.score = score.score + 1;
    fs.writeFileSync(address, JSON.stringify(score));
    return score.score;
}
function rating(name){
    let players = []
    let files = fs.readdirSync('./players/');
    for(let i = 0 ; i<files.length;i++){
        players.push(JSON.parse(fs.readFileSync('./players/' + files[i]).toString()));
    }
    console.log(name);
    let sorted = _.orderBy(players,'score','desc');
    return _.findIndex(sorted,{'name': name})+1;
    
}
function status(socket ,thisRoom ,result , i , j){
    console.log(result.win);
    if (result.win != -1) {
        if (result.win == 2) {
            toFile(thisRoom.firstPlayer.name);
            toFile(thisRoom.lastPlayer.name);
            let obj = { players: [] };
            obj.players[thisRoom.firstPlayer.number] = rating(thisRoom.firstPlayer.name);
            obj.players[thisRoom.lastPlayer.number] = rating(thisRoom.lastPlayer.name);
            io.to(thisRoom.name).emit('equ', obj);
            try{thisRoom.firstPlayer.socket.leave(thisRoom.name);}catch(e){}
            thisRoom.lastPlayer.socket.leave(thisRoom.name);
            return;
        }
        if (result.win == thisRoom.firstPlayer.number) {
            toFile(thisRoom.firstPlayer.name);
            io.to(thisRoom.name).emit('win', { winner: result.win, rating: rating(thisRoom.firstPlayer.name) });
            try{thisRoom.firstPlayer.socket.leave(thisRoom.name);}catch(e){}
            thisRoom.lastPlayer.socket.leave(thisRoom.name);
        }
        else {
            toFile(thisRoom.lastPlayer.name);
            io.to(thisRoom.name).emit('win', { winner: result.win, rating: rating(thisRoom.lastPlayer.name) });
            try{thisRoom.firstPlayer.socket.leave(thisRoom.name);}
            catch(e){}
            thisRoom.lastPlayer.socket.leave(thisRoom.name);
        }
    }
    else {
        console.log('send btn');
        if (result.r == true) {
            io.to(thisRoom.name).emit('btnR', { r: true, p: result.p, num: i * 3 + j });
            console.log('emitted');
        }
        else {
            console.log('false emitted');
            socket.emit('btnR', { r: false });
        }
    }
}