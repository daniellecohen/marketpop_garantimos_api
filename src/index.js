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

app.get('/', (req, res) => {
    res.send(`Main`)
});

// app.get('/users', async (req, res) => {
//     try {
//         let users = await User.find();
//         return res.send(users);
//     } catch (error) {
//         return res.status(400).send(error);
//     };
// });

// app.delete('/users/:userID', async(req, res) => {
//     try {
//         await User.findOneAndRemove({_id: req.params.userID});
//         return res.send('Foi');
//     } catch (error) {
//         return res.status(400).send(error);
//     }
// })

app.listen(process.env.PORT, () => {
    console.log('Listening');
})
