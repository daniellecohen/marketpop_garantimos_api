require("dotenv").config();
const bcrypt = require("bcryptjs");

const express = require("express");

const tokenMiddleware = require("../middlewares/token");

const router = express.Router();

const User = require("../models/user");
router.post("/", async (req, res) => {
  try {
    let user = await User.findOne({ _id: req.body.id }).populate("clients");
    let data = {};
    data.company_name = user.company_name;
    data.address = user.address;
    if (user.site) data.site = user.site;
    return res.send(data);
  } catch (error) {
    return res.status(500).send({ error: "internal error" });
  }
});

router.use(tokenMiddleware);
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
    if (req.body.admin)
      return res.status(400).send("You can't change admin type here");
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

router.put("/change", async (req, res) => {
  try {
    let user = await User.findOne({ _id: req.tokendecoded });
    if (!user.admin) {
      return res.status(401).send({ error: "User not a admin" });
    }
  } catch (err) {
    return res.status(500).send(err);
  }

  try {
    let { userID } = req.body;
    delete req.body.userID;
    if (!userID) return res.status(404).send({ error: "UserID not found" });

    if (req.body.password) {
      const hash = await bcrypt.hash(req.body.password, 10);
      req.body.password = hash;
    }
    await User.findOneAndUpdate(
      { _id: userID },
      req.body,
      { new: false },
      (err, user) => {
        if (!err) return res.send({ success: "successfully updated" });
        else return res.status(400).send(err);
      }
    );
  } catch (error) {
    return res.status(500).send(err);
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

router.put("/admin", async (req, res) => {
  try {
    await User.findOneAndUpdate(
      { email: req.body.email },
      { admin: Boolean(req.body.admin) },
      { new: false },
      (err, user) => {
        if (!err) return res.send({ success: `successfully updated` });
        else return res.status(400).send(err);
      }
    );
  } catch (error) {
    return res.status(400).send(err);
  }
});

module.exports = app => app.use("/user", router);
