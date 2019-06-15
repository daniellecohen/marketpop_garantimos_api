require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

require('./controllers/auth')(app);
require('./controllers/user')(app);
require('./controllers/warranty')(app);

const User = require('./models/user');
const Warranty = require('./models/warranty');

app.get('/', (req, res) => {
    res.send(`Main`)
});

app.post('/users', async (req, res) => {
    try {
        if(req.body.pin == '07062019') {
            let users = await User.find().populate('warranties');
            return res.send(users);
        } else {
            return res.status(400).send({error: 'incorrect pin'});
        }
    } catch (error) {
        return res.status(400).send(error);
    };
});

app.delete('/users/:userID', async(req, res) => {
    try {
        await User.findOneAndRemove({_id: req.params.userID});
        return res.send('Foi');
    } catch (error) {
        return res.status(400).send(error);
    }
})

app.listen(process.env.PORT, () => {
    console.log('Listening');
})
