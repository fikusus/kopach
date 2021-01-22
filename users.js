//массив активных пользователей
let users = [];
var mergeJSON = require("merge-json");
//функция добавления нового пользователя
const addUser = ({ id, name }) => {
  const user = {
    id,
    name,
    position: new Object(),
    animation: new Object(),
  };
  //закидываем в массив
  users.push(user);
  return { user };
};
//функция удаления пользователя по id
const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) return users.splice(index, 1)[0];
};

//получение пользователя по id
const getUser = (id) => users.find((user) => user.id === id);

//задание новых координат
const setCords = (id, myJsonObj) => {
  let curr = getUser(id);
  var result = mergeJSON.merge(curr.position, myJsonObj);
  curr.position = result;
};

//экспорт функций для использование в других файлах
module.exports = {
  addUser,
  removeUser,
  getUser,
  setCords,
  users,
};