//#3 setup DB models
const Sequelize = require("sequelize");

let options = {};
let databaseURL = process.env.DATABASE_URL;
if (!databaseURL) {
  // this means we're on localhost!
  databaseURL = "postgres://hackupstate@localhost:5432/blog";
  options = {
    logging: false,
  };
} else {
  // we're not on localhost
  options = {
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  };
}

const db = new Sequelize(databaseURL, options);
const User = require("./User")(db);
const Post = require("./Post")(db);

//#5 connect and sync to DB
const connectToDB = async () => {
  try {
    await db.authenticate();
    console.log("Connected successfully");
    await db.sync(); //#6 sync by creating the tables based off our models if they don't exist already
    await createFirstUser();
    await createSecondUser();
  } catch (error) {
    console.error(error);
    console.error("PANIC! DB PROBLEMS!");
  }
};

connectToDB();

module.exports = { db, User, Post }; //#7 export out the DB & Model so we can use it else where in our code
