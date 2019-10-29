const express = require("express");

const tokenMiddleware = require("../middlewares/token");

const router = express.Router();
router.use(tokenMiddleware);

const Client = require("../models/client");
const User = require("../models/user");

router.get("/", async (req, res) => {
  const clients = await Client.find();

  return res.json(clients);
});

router.post("/", async (req, res) => {
  const user = await User.findOne({ _id: req.tokendecoded }).populate(
    "clients"
  );
  let _client = "";
  for (let client of user.clients) {
    if (client.tel == req.body.tel) {
      _client = client;
    }
  }
  if (_client === "") {
    let client = await Client.create(req.body);
    user.clients.push(client);
    await User.findOneAndUpdate(
      { _id: user._id },
      user,
      { new: false },
      async (err, warr) => {
        if (err) return res.status(400).send(err);
      }
    );
    return res.send("client created");
  } else {
    await Client.findOneAndUpdate(
      { _id: _client._id },
      { points: _client.points + 1 },
      { new: false },
      async (err, warr) => {
        if (err) return res.status(400).send(err);
      }
    );
  }
  return res.send(`client updated ${_client.points + 1}`);
});

router.put("/", async (req, res) => {
  const user = await User.findOne({ _id: req.tokendecoded }).populate(
    "clients"
  );
  let _client = "";
  for (let client of user.clients) {
    if (client.tel == req.body.tel) {
      _client = client;
    }
  }
  if (_client === "") {
    return res.status(404).send("User not found");
  }
  if (_client.points < user.rewardCount) {
    return res.status(400).send("User does not have necessary points");
  }

  await Client.findOneAndUpdate(
    { _id: _client._id },
    { points: _client.points - user.rewardCount },
    { new: false },
    async (err, warr) => {
      if (err) return res.status(400).send(err);

      return res.send("User rewarded");
    }
  );
});

module.exports = app => app.use("/client", router);
