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

  let pointsToAdd = parseInt(req.body.points);
  if (!pointsToAdd || !Number.isInteger(pointsToAdd)) pointsToAdd = 1;

  let _client = "";
  let newUser = true;
  for (let client of user.clients) {
    if (client.tel == req.body.tel) {
      _client = client;
      newUser = false;
    }
  }

  if (newUser) {
    let client = await Client.create({ tel: req.body.tel });
    user.clients.push(client);

    await User.findOneAndUpdate(
      { _id: user._id },
      user,
      { new: false },
      async (err, warr) => {
        if (err) return res.status(500).send(err);
      }
    );

    for (let client of user.clients) {
      if (client.tel == req.body.tel) {
        _client = client;
      }
    }
  }
  if (!_client) if (err) return res.status(500).send(err);

  //Caso seja novo usuario e tenha sido indicado
  if (req.body.loyaltyNumber && newUser) {
    pointsToAdd += 1;

    for (let client of user.clients) {
      if (client.tel == req.body.loyaltyNumber) {
        loyaltyPerson = client;
      }
    }

    await Client.findOneAndUpdate(
      { _id: loyaltyPerson._id },
      { points: loyaltyPerson.points + 1 },
      { new: false },
      async (err, warr) => {}
    );
  }

  await Client.findOneAndUpdate(
    { _id: _client._id },
    { points: _client.points + pointsToAdd },
    { new: false },
    async (err, warr) => {
      if (err) return res.status(400).send(err);
    }
  );

  return res.send({
    resp: `client updated`,
    newPoints: _client.points + pointsToAdd
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
    { points: _client.points - pointsToRemove, rewarded: _client.rewarded + 1 },
    { new: false },
    async (err, warr) => {
      if (err) return res.status(400).send(err);

      return res.send("User rewarded");
    }
  );
});

router.put("/name", async (req, res) => {
  /*body
  { tel - Tel of person who gonna have name changed ,
  name - Points to remove }*/
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
  await Client.findOneAndUpdate(
    { _id: _client._id },
    { name: req.body.name },
    { new: false },
    async (err, warr) => {
      if (err) return res.status(400).send(err);
      return res.send("Name changed");
    }
  );
});

module.exports = app => app.use("/client", router);
