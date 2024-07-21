const express = require("express");
const fs = require("fs");
const path = require("path");
const Joi = require("joi");

const app = express();

const userScheme = Joi.object({
  name: Joi.string().min(2).required(),
  surname: Joi.string().min(2).required(),
  age: Joi.number().min(0).required(),
  city: Joi.string().min(2),
});

const idScheme = Joi.object({ id: Joi.number().required() });

let uniqieID = 0;

const usersListFilePath = path.join(__dirname, "users.json");

app.use(express.json());

// получить всех пользователей
app.get("/users", (req, res) => {
  const usersJson = fs.readFileSync(usersListFilePath, "utf-8");
  const usersParsed = JSON.parse(usersJson);
  res.send({ users: usersParsed });
});

// получить пользователя по ID
app.get("/users/:id", (req, res) => {
  const usersJson = fs.readFileSync(usersListFilePath, "utf-8");
  const usersParsed = JSON.parse(usersJson);
  const user = usersParsed.find((user) => user.id === Number(req.params.id));
  if (user) {
    res.send({ user });
  } else {
    res.status(400);
    res.send({ user: null, message: "User not found" });
  }
});

// создать пользователя
app.post("/users", (req, res) => {
  const validate = userScheme.validate(req.body);
  if (validate.error) {
    return res.status(400).send({ error: validate.error.details });
  }
  uniqieID += 1;
  const usersJson = fs.readFileSync(usersListFilePath, "utf-8");
  const usersParsed = JSON.parse(usersJson);

  usersParsed.push({ id: uniqieID, ...req.body });

  fs.writeFileSync(usersListFilePath, JSON.stringify(usersParsed));

  res.send({ id: uniqieID });
});

//  обновить пользователя
app.put("/users/:id", (req, res) => {
  const validate = userScheme.validate(req.body);
  if (validate.error) {
    return res.status(400).send({ error: validate.error.details });
  }
  const usersJson = fs.readFileSync(usersListFilePath, "utf-8");
  const usersParsed = JSON.parse(usersJson);
  const user = usersParsed.find((user) => user.id === Number(req.params.id));

  if (user) {
    user.name = req.body.name;
    user.surname = req.body.surname;
    user.age = req.body.age;
    user.city = req.body.city;

    fs.writeFileSync(usersListFilePath, JSON.stringify(usersParsed));

    res.send({ user });
  } else {
    res.status(404);
    res.send({ user: null });
  }
});

// удалить пользователя
app.delete("/users/:id", (req, res) => {
  const usersJson = fs.readFileSync(usersListFilePath, "utf-8");
  const usersParsed = JSON.parse(usersJson);
  const user = usersParsed.find((user) => user.id === Number(req.params.id));
  if (user) {
    const userIndex = usersParsed.indexOf(user);
    usersParsed.splice(userIndex, 1);
    fs.writeFileSync(usersListFilePath, JSON.stringify(usersParsed));
    res.send({ message: `User successfuly removed.` });
  } else {
    res.status(404);
    res.send({ user: null });
  }
});

// метод USE срабатывает, если ни один из введённых пользователем путей не совпадает
app.use((req, res) => {
  res.status(404).send({ message: "URL not found!" });
});

const port = 3000;
app.listen(port);
console.log(`Server at port  ${port} is started`);
