const express = require('express'),
    app = express(),
    fs = require('fs'),
    _ = require('lodash'),
    path = require('path'),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    ai = require('./ai'),
    room = require('./room'), rooms = [];

app.use(express.static(path.join(__dirname, 'static')))

app.get('/', (req, res, next) => {
    res.sendFile(__dirname + '/static/index.html');
});

app.get('/admin',(req,res,next)=>{
    let players = []
    let files = fs.readdirSync('./players/');
    for (let i = 0; i < files.length; i++) {
        players.push(JSON.parse(fs.readFileSync('./players/' + files[i]).toString()));
    }
    let sorted = _.orderBy(players, 'score', 'desc');
    sorted.forEach((value,index)=>{
        res.write(index+'. '+value.name + ' is '+value.score + '\n');
    })
    res.send();
})

io.on('connection', function (socket) {
    socket.on('game', (data) => {
        //game request
        if (data.mode == 'multi') {
            //multi mode game requested
            //create new room if it's capacity is full :)
            if (rooms.length == 0 || rooms[rooms.length - 1].roomCheck() == 2) {
                rooms.push(new room(rooms.length.toString()));
            }
            let lastRoom = rooms[rooms.length - 1];
            if (lastRoom.roomCheck() == 0) {
                lastRoom.firstPlayer = data.name;
                lastRoom.firstPlayer.socket = socket;
                socket.join(lastRoom.name);
                socket.emit('waitG');
                //wait pulse for first player
            } else {
                lastRoom.lastPlayer = data.name;
                lastRoom.lastPlayer.socket = socket;
                socket.join(lastRoom.name);
                let player = { p1: lastRoom.firstPlayer.number, p2: lastRoom.lastPlayer.number };
                io.to(lastRoom.name).emit('startG', player);
                //start pulse to all player of last room
            }
        } else {
            //single mode requested
            let thisRoom = new room(rooms.length.toString());
            socket.join(thisRoom.name);
            rooms.push(thisRoom);
            thisRoom.lastPlayer.name = data.name;
            thisRoom.lastPlayer.socket = socket;
            //new robat creation
            let bot = new ai(thisRoom.firstPlayer.number);
            thisRoom.firstPlayer.name = bot.name;
            thisRoom.firstPlayer.socket = bot;
            thisRoom.lastPlayer.socket.emit('startG', { p1: thisRoom.firstPlayer.number, p2: thisRoom.lastPlayer.number });
            //start pulse to player
            if(thisRoom.firstPlayer.number == 0){
                //if robat should play first then move
                setTimeout(()=>{
                let moved = thisRoom.firstPlayer.socket.move(thisRoom.xo);
                let resultBot = thisRoom.fill(moved.i, moved.j, thisRoom.firstPlayer.socket.name);
                status(socket, thisRoom, resultBot, moved.i, moved.j);
                },8*1000);
                //8 seconds for creation page in client
            }
        }
    })

    socket.on('btn', (btn) => {
        // a button clicked
        let thisRoom = rooms[parseInt(Object.keys(socket.rooms)[0])];
        //find room of this socket
        let result = thisRoom.fill(btn.i, btn.j, btn.name);
        status(socket, thisRoom, result, btn.i, btn.j);
        //win? fail? equal? or continue? ...
        if(thisRoom.firstPlayer.socket.name)
        {
            //in single mode , robot and it's move ...
            let moved = thisRoom.firstPlayer.socket.move(thisRoom.xo);
            let resultBot = thisRoom.fill(moved.i, moved.j, thisRoom.firstPlayer.socket.name);
            status(socket, thisRoom, resultBot, moved.i, moved.j);
        }
    })

    socket.on('disconnecting',(data)=>{
        //a user closed game or canceled?
        let thisRoom = rooms[parseInt(Object.keys(socket.rooms)[0])];
        if(!thisRoom){
            //Room not find? it is not a correct game .
            return;
        }
        socket.leave(thisRoom.name);
        io.to(thisRoom.name).emit('dis');
        //disconnection pulse to another player
    })
});
http.listen((process.env.PORT||3516) , function () {
    console.log('listening on *:4000');
});

function toFile(winner){
    //it save player and it's score
    let address = './players/' + winner + '.json';
    let score;
    try {
        score = JSON.parse(fs.readFileSync(address).toString());
    }
    catch (e) {
        //file creation
        fs.writeFileSync(address, '');
        score = { name : winner ,score: 0 };
    }
    score.score = score.score + 1;
    fs.writeFileSync(address, JSON.stringify(score));
    return score.score;
}
function rating(name){
    //read players from files and sort them and return score on name
    let players = []
    let files = fs.readdirSync('./players/');
    for(let i = 0 ; i<files.length;i++){
        players.push(JSON.parse(fs.readFileSync('./players/' + files[i]).toString()));
    }
    let sorted = _.orderBy(players,'score','desc');
    return _.findIndex(sorted,{'name': name})+1;
}
function status(socket ,thisRoom ,result , i , j){
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
        if (result.r == true) {
            io.to(thisRoom.name).emit('btnR', { r: true, p: result.p, num: i * 3 + j });
        }
        else {
            //incorrect bt clicking!
            socket.emit('btnR', { r: false });
        }
    }
}
