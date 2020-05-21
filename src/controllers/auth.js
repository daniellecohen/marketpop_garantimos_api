require("dotenv").config();

const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const mailer = require("./../modules/mailer");

const jwt = require("jsonwebtoken");
const tokenProvider = require("../config/token.json");

const router = express.Router();

const User = require("../models/user");
const Coupon = require("../models/coupon");

router.post("/register", async (req, res) => {
  const { email, telephone } = req.body;
  try {
    if (await User.findOne({ email }))
      return res.status(400).send({ error: "email already exist" });
    if (await User.findOne({ telephone }))
      return res.status(400).send({ error: "telephone already exist" });
    if (!req.body.coupon)
      return res
        .status(400)
        .send({ error: "You need a coupon to create a account" });

    let userCoupon = req.body.coupon;
    delete req.body.coupon;

    let coupon = await Coupon.findOne({ code: userCoupon });
    if (!coupon) return res.status(400).send({ error: "Coupon not found" });
    if (coupon.usedBy != "")
      return res.status(400).send({ error: "Coupon already used" });

    let user = await User.create(req.body);
    const token = jwt.sign({ id: user._id }, tokenProvider.secret, {
      expiresIn: 311040000
    });

    await Coupon.findOneAndUpdate(
      { code: userCoupon },
      { usedBy: user._id },
      { new: false },
      async (err, warr) => {
        if (err) return res.status(500).send(err);
      }
    );

    return res.send({ token });
  } catch (error) {
    return res.status(500).send({ error });
  }
});

router.post("/", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select("+password");

    if (!user) return res.status(401).send({ error: "user doesnt exist" });
    if (!(await bcrypt.compare(password, user.password)))
      return res.status(401).send({ error: "invalid password" });

    user.password = undefined;
    const token = jwt.sign({ id: user._id }, tokenProvider.secret, {
      expiresIn: 311040000
    });
    return res.send({ token });
  } catch (error) {
    return res.status(500).send(error);
  }
});

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email }).select("+passwordResetToken");
    if (!user) return res.status(401).send({ error: "user doesnt exist" });

    const token = crypto.randomBytes(20).toString("hex");
    const now = new Date();
    now.setHours(now.getHours() + 1);

    user.passwordResetToken = token;
    user.passwordResetExpires = now;

    await User.findOneAndUpdate(
      { _id: user._id },
      user,
      { new: false },
      async (err, warr) => {
        if (err) return res.status(500).send(err);
      }
    );
    await mailer.sendMail(
      {
        to: email,
        from: "noreply@pingui.com.br",
        template: "forgot-password",
        subject: "Troca de senha PINGUI",
        context: {
          link: `${
            process.env.LOCATION == "PROD"
              ? "https://bytemetech.github.io/fidelizapp-web/"
              : "https://sharp-einstein-89f586.netlify.com"
          }/reset-password.html?token=${token}`
        }
      },
      (err, info) => {
        if (err) {
          return res
            .status(400)
            .send({ error: "Cannot send forgot password email" });
        }
        return res.send({ message: "email sended" });
      }
    );
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ error: "Error on forgot password, try again" });
  }
});
router.put("/forgot-password", async (req, res) => {
  const { email, token, password } = req.body;
  if (!token || !password || !email) {
    return res.status(400).send({
      error: "email, token and password needed to change a user password"
    });
  }
  try {
    let user = await User.findOne({ email }).select(
      "+passwordResetToken passwordResetExpires"
    );
    if (!user) return res.status(404).send({ error: "user not found" });
    if (user.passwordResetToken != token) {
      console.log(token, user.passwordResetToken);
      return res.status(401).send({ error: "Token wrong" });
    }
    let now = new Date();
    if (now > user.passwordResetExpires)
      return res
        .status(401)
        .send({ error: "Token expired, generate a new one" });

    user.password = password;
    user.passwordResetExpires = now;
    await user.save();
    const loginToken = jwt.sign({ id: user._id }, tokenProvider.secret, {
      expiresIn: 311040000
    });
    return res.send({ token: loginToken });
  } catch (err) {
    return res.status(500).send({
      error: "Error on change password, try again",
      errorMessage: err
    });
  }
});
module.exports = app => app.use("/auth", router);
