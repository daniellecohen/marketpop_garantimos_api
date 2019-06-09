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
        const user = await User.findById(req.tokendecoded);
        
        let data = req.body;
        data.token = generateToken();
        let unique_token = false;

        while(!unique_token) {
            if(!await Warranty.findOne({token: data.token})) {
                unique_token = true;
            }
        }

        let days_to_warrante = data.warranty_date;
        let date = new Date().setDate(new Date().getDate()+days_to_warrante);
        data.warranty_date = new Date(date);
        
        data.client_name = `Cliente ${Date.now()}`;
        data.exchange = 0;

        const warranty = await Warranty.create(data);

        user.warranties.push(warranty);
        await User.findOneAndUpdate({_id: user._id}, user, {new: false});

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
            return res.send({warranty: 'the warranty date has passed'});
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
        let exchange = warranty.exchanges + 1;

        await Warranty.findOneAndUpdate({token: req.params.token}, {warranty_date: new_warranty_date, exchanges: exchange}, {new: false}, (err, warr) => {
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