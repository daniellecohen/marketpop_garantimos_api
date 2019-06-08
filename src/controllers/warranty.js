require('dotenv').config();

const express = require('express');

const tokenMiddleware = require('../middlewares/token');

const router = express.Router();
router.use(tokenMiddleware);

const User = require('../models/user');
const Warranty = require('../models/warranty');

function generateToken() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 8; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

router.post('/create', async(req, res) => {
    try {
        const users = await User.find();
        const user = await User.findOne({_id: req.tokendecoded});
        
        let data = req.body;
        data.token = generateToken();

        for(var x = 0; x < users.length; x++) {
            if(data.token == users[x].token) {
                data.token = generateToken();
                x = 0;
            }
        }

        let days_to_warrent = data.warranty_date;
        data.warranty_date = new Date().setDate(new Date().getDate()+days_to_warrent)

        const warranty = await Warranty.create(data);
        user.warranties.push(warranty);
        await user.save();

        return res.send({warranty});
    } catch (error) {
        return res.status(400).send(error);
    }
});

router.post('/:token', async(req, res) => {
    try {
        const warranty = await Warranty.findOne({token: req.params.token});

        if(!warranty)
            return res.status(400).send({error: 'item doesnt exist'});
        
        if(new Date(warranty.warranty_date) > new Date()) {
            return res.send({warranty});
        } else {
            return res.send({ops: 'the warranty date has passed'});
        };
    } catch (error) {
        return res.status(400).send(error);
    }
});

router.put('/:token/exchange', async(req, res) => {
    try {
        const warranty = await Warranty.findOne({token: req.params.token});

        if(!warranty)
            return res.status(400).send({error: 'item doesnt exist'});

        let new_warranty_date = new Date().setDate(new Date().getDate()+req.body.warranty_date);
        let exchange = warranty.exchange + 1;

        await Warranty.findOneAndUpdate({token: req.params.token}, {warranty_date: new_warranty_date, exchange: exchange}, {new: false}, (err, warr) => {
            if(!err)
                return res.send({success: 'successfully updated'});
            else
                return res.status(400).send(err);
        });
        
    } catch (error) {
        return res.status(400).send(error);
    }
});

module.exports = app => app.use('/warranty', router);