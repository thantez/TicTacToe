const socket = io('https://noters.ir/socket.io');
var player, nobat, name , clicked = false;
$('form').submit(function () {
    name = $("#nameInp").val();
    var mode = $("#modeSel").val();
    socket.emit('game', {
        name: name,
        mode: mode
    });
    return false;
});

socket.on('waitG', () => {
    player = 1;
    $("#sendBtn").html("please wait for second player ...");
    $("#sendBtn").css('color', 'red');
    $("#sendBtn").prop('disabled', true);
});

socket.on('startG', (data) => {
    if (player) {
        player = data.p1;
    } else {
        player = data.p2;
    }
    $("#sendBtn").html("after 7 seconds, game willbe starting");
    $("#sendBtn").css('color', 'black');
    $("#sendBtn").prop('disabled', true);
    setTimeout(() => {
        $("#body").empty();
        $("#head").empty();
        $("head").append(`
            <meta charset="utf-8">
            <meta name="viewport" content="initial-scale=1.0">
            <title>game</title>
            <link href="http://fonts.googleapis.com/css?family=Raleway:300,400,400,100" rel="stylesheet" type="text/css">
            <link rel="stylesheet" href="css/standardize.css">
            <link rel="stylesheet" href="css/game-grid.css">
            <link rel="stylesheet" href="css/game.css">`);
        $("#body").append(`
            <div class="container container-1 clearfix" id="btns">
                <button id="0" class="_button _button-1 js-btn-g-v"></button>
                <button id="1" class="_button _button-2 js-btn-g-v"></button>
                <button id="2" class="_button _button-3 js-btn-g-v"></button>
                <button id="3" class="_button _button-4 js-btn-g-v"></button>
                <button id="4" class="_button _button-5 js-btn-g-v"></button>
                <button id="5" class="_button _button-6 js-btn-g-v"></button>
                <button id="6" class="_button _button-7 js-btn-g-v"></button>
                <button id="7" class="_button _button-8 js-btn-g-v"></button>
                <button id="8" class="_button _button-9 js-btn-g-v"></button>
            </div>
            <div class="container container-2 clearfix">
                <p class="text">you are : ${player==0?'x':'o'}</p>
                <p class="text text-2" id="turn">${player==0?'you\'r':'his/m'} turn.</p>
                <button class="_button _button-10" id="btnCancel">cancel</button>
            </div>`);
        $("#body").attr('class', 'container container-1 clearfix');
    }, 7 * 1000);
});

$("body").on('click', '#btns', function (e) {
    if (!clicked) {
        var number = parseInt($(e.target).attr('id'));
        if (isNaN(number)) return;
        socket.emit('btn', {
            name: name,
            i: parseInt(number / 3),
            j: number % 3
        });
        clicked = true;
    } else {}
});

$("body").on('click', '#btnCancel', () => {
    if (confirm('are you sure?')) {
        socket.emit('disconnecting', 'by user');
        window.open('', '_self').close();
        window.close();
        close();
        $("#body").empty();
        $("#head").empty();
        $("head").append(`<link rel="stylesheet" href="css/index.css">`);
        $("#body").append(`<p class="text">Good Bye</p>`);
    }
});

socket.on('btnR', (r) => {
    if (r.r == true) {
        $("#" + r.num).html(r.p == 0 ? 'x' : 'o');
        $("#turn").html((r.p == player ? 'his/m' : 'you\'r') + " turn.");
    } else {
        alert("its his/m turn or select disable button.");
    }
    clicked = false;
})

socket.on('win', (data) => {
    $("#body").empty();
    $("#head").empty();
    $("head").append(`<link rel="stylesheet" href="css/index.css">`);
    if (player == data.winner) {
        $("#body").append(`<p class="text">YOU WON</p><p class="text">you'r rating is ${data.rating}</p>`);
    } else {
        $("#body").append(`<p class="text">GAME OVER</p>`);
    }
})

socket.on('equ', (data) => {
    $("#body").empty();
    $("#head").empty();
    $("head").append(`<link rel="stylesheet" href="css/index.css">`);
    $("#body").append(`<p class="text">YOU EQUATED</p><p class="text">you'r rating is ${data.players[player]} </p>`);
})

socket.on('dis', () => {
    $("#body").empty();
    $("#head").empty();
    $("head").append(`<link rel="stylesheet" href="css/index.css">`);
    $("#body").append(`<p class="text">DISCONNECTION</br>YOU WON</br>(but not saved in rating.)</p>`);
})
