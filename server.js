require('dotenv').config()
const session = require('express-session')
const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const axios = require('axios');

//
const { log } = require('console')
const app = express()
app.set('trust proxy', 1) // trust first proxy
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    // cookie: { secure: true }
}))


app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '/login.html'));
})

app.post('/', function (req, res) {
    res.redirect('/mainpage')
})

app.get('/mainpage', function (req, res) {
    if (req.session.loggedIn) {
        res.sendFile(path.join(__dirname, '/mainpage.html'));
    } else {
        res.send("hata");
    }
})

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

// Initiates the Google Login flow
app.get('/auth/google', (req, res) => {
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=profile email&prompt=select_account`;
    res.redirect(url);
});

// Callback URL for handling the Google Login response
app.get('/auth/google/callback', async (req, res) => {
    const { code } = req.query;
    req.session.loggedIn = true;
    try {
        // Exchange authorization code for access token
        const { data } = await axios.post('https://oauth2.googleapis.com/token', {
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            code,
            redirect_uri: REDIRECT_URI,
            grant_type: 'authorization_code',
        });

        // const { access_token, id_token } = data;

        // // Use access_token or id_token to fetch user profile
        // const { data: profile } = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
        //     headers: { Authorization: `Bearer ${access_token}` },
        // });

        // Code to handle user authentication and retrieval using the profile data

        res.redirect('/mainpage');
    } catch (error) {
        console.error('Error:', error.response.data.error);
        res.redirect('/');
    }
});

app.listen(port = 3000, () => {
    console.log(`Example app listening on port ${port}`)
})

