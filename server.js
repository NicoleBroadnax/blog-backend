//#1 - express setup (cors, body-parser, bcrypt, sessions)
const express = require("express");
const server = express();
const cors = require("cors");
server.use(
  cors({
    credentials: true,
    origin: [
      "http://localhost:3000",
      "https://nicolebroadnax-blog-backend.herokuapp.com",
    ],
  })
);
const bodyParser = require("body-parser");
server.use(bodyParser.json());
const bcrypt = require("bcrypt");

const sessions = require("express-session");
const { db, User, Post } = require("./db/db.js"); //#2, #8 DB setup
const sequelizeStore = require("connect-session-sequelize")(sessions.Store);
const oneMonth = 1000 * 60 * 60 * 24 * 30;
server.use(
  sessions({
    secret: "mysecretkey",
    store: new sequelizeStore({ db }),
    cookie: { maxAge: oneMonth },
  })
);

server.get("/", (req, res) => {
  res.send({ hello: "world" });
});

server.post("/login", async (req, res) => {
  const user = await User.findOne(
    { where: { username: req.body.username } },
    { raw: true }
  );
  if (!user) {
    res.send({ error: "username not found" });
  } else {
    const matchingPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (matchingPassword) {
      req.session.user = user;
      res.send({ success: true, message: "open sesame" });
    } else {
      res.send({ error: "no go. passwords don't match." });
    }
  }
});

server.get("/loginStatus", (req, res) => {
  if (req.session.user) {
    res.send({ isLoggedIn: true });
  } else {
    res.send({ isLoggedIn: false });
  }
});

server.get("/logout", (req, res) => {
  req.session.destroy();
  res.send({ isLoggedIn: false });
});
const authRequired = (req, res, next) => {
  if (!req.session.user) {
    res.send({ error: "You're not signed in. No posting for you!" });
  } else {
    next();
  }
};
server.post("/post", authRequired, async (req, res) => {
  await Post.create({
    title: req.body.title,
    content: req.body.content,
    authorID: req.session?.user?.id,
  });
  res.send({ post: "created" });
});

server.delete("/post/:id", authRequired, async (req, res) => {
  await Post.destroy({ where: { id: req.params.id } });
  res.send({ success: true, message: "That post is outta here" });
});

server.get("/posts", async (req, res) => {
  res.send({ posts: await Post.findAll({ order: [["id", "DESC"]] }) });
});

server.get("/post/:id", async (req, res) => {
  res.send({ post: await Post.findByPk(req.params.id) });
});

// if heroku, process.env.PORT will be provided
let port = process.env.PORT;
if (!port) {
  // otherwise, fallback to localhost 3001
  port = 3001;
}

//#9 run express API server in background to listen for incoming requests
server.listen(port, () => {
  console.log("Server running.");
});

//#10 seeding the database
const createFirstUser = async () => {
  const users = await User.findAll();
  if (users.length === 0) {
    User.create({
      username: "Nicole",
      password: bcrypt.hashSync("hello1", 10),
    });
  }
};

const createSecondUser = async () => {
  const users = await User.findAll();
  if (users.length === 0) {
    User.create({
      username: "Nov",
      password: bcrypt.hashSync("Hello2", 10),
    });
  }
};

createFirstUser();
createSecondUser();
