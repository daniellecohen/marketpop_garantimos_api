require("dotenv").config();

const mongoose = require("mongoose");
console.log("mongo_URI", process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true }, () => {
  console.log("Database is connected");
});
mongoose.set("useFindAndModify", false);
mongoose.set("userCreateIndex", true);
mongoose.Promise = global.Promise;

module.exports = mongoose;
