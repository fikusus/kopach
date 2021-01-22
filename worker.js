//импорт функция для использования
const {
    addUser,
    removeUser,
    getUser,
    setCords,
    users,
  } = require("./users");

//текущая комната
let roomName;

//позиция нового пользователя
let userStartPos = {
    p_x: "49.39",
    p_y: "0",
    p_z: "-24.1",
    r_x: "0",
    r_y: "1",
    r_z: "0",
    r_w: "0",
  };

//прием сообщений от главного потока
process.on("message", async(msg) => {
    switch(msg["type"]) {
        case "createRoom": 

        break;

        case "join": 
            roomName = msg["info"]["room"];    
            let data = userStartPos;

            data["receiver"] = roomName;
            data["emit"] = "enterNewPlayer";
            data["id"] = msg["socketID"];

            //отправлем на 61 в index (в главный поток)
            //получение координат существующих пользователей для для их создания новому пользователю
            users.forEach(async (element) => {
                console.log(element);
                process.send({receiver:element.id, emit:"getting-user-info", id:msg["socketID"]});
              });
            //добавление нового пользователя в массив пользователей
            addUser({id: msg["socketID"], name: msg["info"]["name"]});
            //отправка всем пользователям комнаты инфу о том, что появился новый пользователь на 61
            process.send(data);
        break;

        case "disconnect": 
            removeUser(msg["socketID"]);
            console.log(users);

            if(users.length === 0) {
                process.exit(0);
            }

        break;

    }
})