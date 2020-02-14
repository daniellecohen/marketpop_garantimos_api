const path = require("path");
const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");

var transport = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "06b9c98442d834",
    pass: "d3ea47f255b60e"
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
