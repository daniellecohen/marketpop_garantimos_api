require("dotenv").config();
const bcrypt = require("bcryptjs");

const express = require("express");

const tokenMiddleware = require("../middlewares/token");

const router = express.Router();

const User = require("../models/user");
const Coupon = require("../models/coupon");

const General = require("../models/general");

// Deixando claro que esse código está errado, não se faz isso. Foi uma solução rápida para colocar para funcionar logo.


router.get("/nextcoupon", async (req, res) => {
    try {
      try {
        let general = await General.findOne({ uniqueCouponCode: "codigoCupom" }); //fixo, só pra atualizar sempre a vesma variavel
        let lastCouponUsed = general.lastCouponUsed;
        var lastCouponUsedInt = parseInt(lastCouponUsed);
        var nextCoupon = lastCouponUsedInt + 1;

        // Find the document that describes "legos"
        const query = { "uniqueCouponCode": "codigoCupom" };
        // Set some fields in that document
        const update = {
        "$set": {
            "lastCouponUsed": String(nextCoupon)
            }
        };
        // Return the updated document instead of the original document
        const options = { returnNewDocument: true };

        General.findOneAndUpdate(query, update, options)
        .then(updatedDocument => {
            if(updatedDocument) {
            console.log(`Successfully updated document: ${updatedDocument}.`)
            } else {
            console.log("No document matches the provided query.")
            }
            return updatedDocument
        })
        .catch(err => console.error(`Failed to find and update document: ${err}`))    
        return res.send(String(nextCoupon));

      } catch (error) {
        return res.status(400).send(err);
      }
    } catch (error) {
      return res.status(500).send({ error: "internal error" });
    }
  });


  //Criar cupom em massa (10 em 10)
  router.use(tokenMiddleware);
  router.post("/masscoupon", async (req, res) => {

    try {
        let user;
        try {
          user = await User.findOne({ _id: req.tokendecoded });
          if (!user.admin) {
            return res.status(401).send({ error: "User not a admin" });
          }
        } catch (error) {
          return res.status(500).send({ error: "internal error1" });
        }
  
      try {
        let initialcode = req.body.initialcode;
        console.log(initialcode);

        if (!initialcode) return res.status(401).send({ error: "code is required" });

        var initialcodeInt = parseInt(initialcode);

        for (var i=initialcodeInt; i<initialcodeInt+10; i++) {
            let _coupon = await Coupon.create({
                createdBy: "chatbot",
                code: i
              });
              console.log(i);
        }

        return res.send("Successfully created!");

      } catch (error) {
        return res.status(500).send({ message: "internal error", error });
      }
    } 
    catch (error) {
      return res.status(400).send(err);
    }
  });

module.exports = app => app.use("/general", router);
