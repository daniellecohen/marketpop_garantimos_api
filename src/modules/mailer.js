const path = require("path");
const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");

var transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
let handlebarsOptions = {
  viewEngine: {
    extName: ".html",
    partialsDir: path.resolve("./src/resources/mail/"),
    layoutsDir: path.resolve("./src/resources/mail/"),
    defaultLayout: "forgot-password.html"
  },
  viewPath: path.resolve("./src/resources/mail/"),
  extName: ".html"
};

transport.use("compile", hbs(handlebarsOptions));

module.exports = transport;
