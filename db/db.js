//#3 setup DB models
const Sequelize = require("sequelize");

const db = new Sequelize("postgres://nicolebroadnax@localhost:5432/blog", {
  logging: false,
});
const User = require("./User")(db);
const Post = require("./Post")(db);

//#5 connect and sync to DB
const connectToDB = async () => {
  try {
    await db.authenticate();
    console.log("Connected successfully");
    db.sync(); //#6 sync by creating the tables based off our models if they don't exist already
  } catch (error) {
    console.error(error);
    console.error("PANIC! DB PROBLEMS!");
  }
};

connectToDB();

module.exports = { db, User, Post }; //#7 export out the DB & Model so we can use it else where in our code
