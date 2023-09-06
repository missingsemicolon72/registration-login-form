require('dotenv').config();
const express = require('express');
const path = require('path');
const hbs = require('hbs');
const bcrypt = require('bcryptjs');
const User = require('./models/registrations');
const cookieParser = require('cookie-parser');
const auth = require('./middleware/auth');
require('./db/conn');

const app = express();
const PORT = process.env.PORT || 8888;
const static_path = path.join(__dirname, '../public');
const views_path = path.join(__dirname, '../templates/views');
const partials_path = path.join(__dirname, '../templates/partials');

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(static_path));

app.set('view engine', 'hbs');
app.set('views', views_path);
hbs.registerPartials(partials_path);

app.get('/', (req, res) => {
    res.render('index');
})

app.get('/register', (req, res) => {
    res.render('register');
})

app.get('/login', (req, res) => {
    res.render('login');
})

app.get('/dashboard', auth, (req, res) => {
    res.render('dashboard');
})

app.get('/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(currToken => currToken.token !== req.token);
        res.clearCookie('jwt_login');
        await req.user.save();
        res.redirect('/');
    } catch (error) {
        res.status(500).send(error);
    }
})

app.get('/logout-all', auth, async (req, res) => {
    try {
        req.user.tokens = [];
        res.clearCookie('jwt_login');
        await req.user.save();
        res.redirect('/');
    } catch (error) {
        res.status(500).send(error);
    }
})

app.post('/register', async (req, res) => {
    try {
        const registerUser = new User({
            firstname: req.body.fname,
            lastname: req.body.lname,
            age: req.body.age,
            gender: req.body.gender,
            email: req.body.email,
            phone: req.body.phone,
            password: req.body.pass,
        });

        const registerToken = await registerUser.generateAuthToken();
        if(!registerToken)
            res.status(500).send('Unexpected Error: User was registerd but token was not generated!');
        else
            res.cookie('jwt_register', registerToken, {
                expires: new Date(Date.now() + 300000),
                httpOnly: true,
            });

        const registeredUser = await registerUser.save();
        if(!registeredUser)
            res.status(400).send('ERROR: 400 Bad Request. Make sure the details entered are complete and valid!');
        else
            res.status(201).send(registeredUser);
    } catch (error) {
        res.status(500).send(`An error occurred\n${error}`);
    }
})

app.post('/login', async (req, res) => {
    try {
        const validUser = await User.findOne({email: req.body.email});
        if(!validUser)
            res.status(400).send('ERROR: Invalid Credentials!');
        else{
            if(await bcrypt.compare(req.body.pass, validUser.password)){
                const loginToken = await validUser.generateAuthToken();
                if(!loginToken)
                    res.status(500).send('Unexpected Error: User logged in but token was not generated!');
                else
                    res.cookie('jwt_login', loginToken, {
                        expires: new Date(Date.now() + 300000),
                        httpOnly: true,
                    });
                res.status(200).redirect('dashboard');
            }else
                res.status(400).send('ERROR: Invalid Credentials!');
        }
    } catch (error) {
        res.status(500).send(`An error occurred\n${error}`);
    }
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})