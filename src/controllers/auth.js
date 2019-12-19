const express = require("express");
const bcrypt = require("bcryptjs");

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

module.exports = app => app.use("/auth", router);
