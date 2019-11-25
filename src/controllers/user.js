require("dotenv").config();

const express = require("express");

const tokenMiddleware = require("../middlewares/token");

const router = express.Router();
router.use(tokenMiddleware);

const User = require("../models/user");

router.get("/", async (req, res) => {
  try {
    let user = await User.findOne({ _id: req.tokendecoded }).populate(
      "clients"
    );
    return res.send({ user });
  } catch (error) {
    return res.status(500).send({ error: "internal error" });
  }
});

router.put("/update", async (req, res) => {
  try {
    if (req.body.password)
      return res.status(400).send("You can't change your password here");
    await User.findOneAndUpdate(
      { _id: req.tokendecoded },
      req.body,
      { new: false },
      (err, user) => {
        if (!err) return res.send({ success: "successfully updated" });
        else return res.status(400).send(err);
      }
    );
  } catch (error) {
    return res.status(400).send(err);
  }
});

router.delete("/delete", async (req, res) => {
  try {
    await User.findOneAndRemove({ _id: req.tokendecoded }, (err, user) => {
      if (!err) return res.send({ success: "successfully removed" });
      else return res.status(400).send(err);
    });
  } catch (error) {
    return res.status(400).send(error);
  }
});

router.get("/all", async (req, res) => {
  try {
    let user = await User.findOne({ _id: req.tokendecoded });
    if (!user.admin) {
      return res.status(401).send({ error: "User not a admin" });
    }
  } catch (error) {
    return res.status(500).send({ error: "internal error" });
  }

  try {
    const users = await User.find().populate("clients");
    return res.json(users);
  } catch (error) {
    return res.status(500).send(error);
  }
});

module.exports = app => app.use("/user", router);
