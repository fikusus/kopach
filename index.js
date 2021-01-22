//для реализации многопоточности
const cluster = require("cluster");
//работа с http протоколом
const app = require('express')();
//создание сервера
const http = require('http').createServer(app);
const io = require('socket.io')(http, {pingInterval: 500});

app.get('/', (req, res) => {
    //res.sendFile(__dirname + '/index.html');
    res.send("<h1>Server Has Started</h1>");
});

//массив потоков
var clients = [];
//массив в котором показываем к какой комнате привязан какой пользователь
var users = [];

//при запуске нового потока выполняем файл worker.js
cluster.setupMaster({
  exec: "worker.js",
});

//соединение клиент-сервер
io.on('connection', (socket) => {
    console.log('a user connected');

    //функция обработки дисконекта
    socket.on('disconnect', () => {
        console.log('user disconnected');
        //отправляем потоку, что данный пользователь отсоединился
        clients[users[socket.id]].send({type: "disconnect", socketID: socket.id});
        //delete(clients[users[socket.id]]);
    });

    //запрос на получение socket id
    socket.on('getID', async() => {
        //отправляем клиенту его id
        socket.emit("receiveID", socket.id);
    });

    //запрос со стороны клиента на добавление в комнату сервера 
    socket.on('join', async(info) => {
        console.log("user join");
        //console.log(info);

        //добавляем в массив связку сокет ид - комната
        users[socket.id] = info["room"];

        //есть ли хоть один человек в комнате
        let isExist = io.sockets.adapter.rooms[info["room"]];

        if(!isExist) {
            //создаем новый поток
            let newWorker = cluster.fork();
            //добавляем новый поток в массив потоков
            clients[info["room"]] = newWorker;
            //отправляем потоку запрос на создание комнаты
            newWorker.send({ type: "createRoom", info, socketID: socket.id });
            //61 прием сообщение от потока для отправки клиенту
            newWorker.on("message", async(dataToSend) => {
                    //console.log(dataToSend);
                    //отправка клиентам receiver данные по идентификатору emit
                    io.to(dataToSend["receiver"]).emit(dataToSend["emit"], dataToSend);
            })
        }
        //привязка пользователя к сокетной комнате
        socket.join(info["room"]);
        //отправка потоку запрос на добавление нового пользователя
        clients[info["room"]].send({ type: "join", info, socketID: socket.id });

    });
    //
    socket.on('sending-event', async (msg) => {
        //console.log(msg);
        io.to(msg["receiver"]).emit(msg["emit"], msg);
    });

});


//запуск сервера
http.listen(process.env.PORT || 3000, () => {
    console.log('Connected at 3000');
});