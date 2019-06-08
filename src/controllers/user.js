require('dotenv').config();

const express = require('express');

const tokenMiddleware = require('../middlewares/token');

const router = express.Router();
router.use(tokenMiddleware);

const User = require('../models/user');
const Warranty = require('../models/warranty');

router.get('/', async(req, res) => {
    try {
        let user = await User.findOne({_id: req.tokendecoded}).populate('warranties');
        return res.send({user});
    } catch (error) {
        return res.status(400).send({error: 'internal error'});
    };
});

router.put('/update', async(req, res) => {
    try {
        await User.findOneAndUpdate({_id: req.tokendecoded}, req.body, {new: false}, (err, user) => {
            if(!err)
                return res.send({success: 'successfully updated'});
            else
                return res.status(400).send(err);
        });
    } catch (error) {
        return res.status(400).send(err);
    };
});

router.delete('/delete', async(req, res) => {
    try {
        // let user = await User.findOne({_id: req.tokendecoded});

        // for(warranty of user.warranties) {
        //     await Warranty.findOneAndRemove({_id: warranty._id});
        // }

        await User.findOneAndRemove({_id: req.tokendecoded}, (err, user) => {
            if(!err)
                return res.send({success: 'successfully removed'});
            else
                return res.status(400).send(err);
        });
    } catch (error) {
        return res.status(400).send(error);
    }
});

module.exports = app => app.use('/user', router);