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
  let newPoints = parseInt(req.body.points);
  if (!newPoints) newPoints = 1;
  if (!Number.isInteger(newPoints)) newPoints = 1;
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
    await User.findByIdAndUpdate(
      { _id: user.id },
      { points: newPoints },
      { new: false },
      async (err, warr) => {
        if (err) return res.status(400).send(err);
      }
    );
    return res.send("client created");
  }
  await Client.findOneAndUpdate(
    { _id: _client._id },
    { points: _client.points + newPoints },
    { new: false },
    async (err, warr) => {
      if (err) return res.status(400).send(err);
    }
  );
  return res.send({
    resp: `client updated`,
    newPoints: _client.points + newPoints
  });
});

router.put("/", async (req, res) => {
  /*body
  { tel - Tel of person who gonna have points removed ,
    points - Points to remove }*/
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
  let pointsToRemove = req.body.points;
  if (!pointsToRemove) pointsToRemove = user.rewardCount;
  if (_client.points < pointsToRemove) {
    return res.status(400).send("User does not have necessary points");
  }

  await Client.findOneAndUpdate(
    { _id: _client._id },
    { points: _client.points - pointsToRemove },
    { new: false },
    async (err, warr) => {
      if (err) return res.status(400).send(err);

      return res.send("User rewarded");
    }
  );
});

module.exports = app => app.use("/client", router);
