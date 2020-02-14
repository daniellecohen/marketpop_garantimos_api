require("dotenv").config();

const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true }, () => {
  console.log("Database is connected");
});
mongoose.set("useFindAndModify", false);
mongoose.set("userCreateIndex", true);
mongoose.Promise = global.Promise;

module.exports = mongoose;
