require('dotenv').config()
const express = require('express');
const fs = require('fs')
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({limit:'10mb', extended: true}))
app.use(bodyParser.json());
const MongoDb = require('./controllers/db');
const PORT = process.env.PORT;
const Root = require('./routes/Root');
const Users = require('./routes/Users');
const Search = require('./routes/Search');
const Favorites = require('./routes/Favorites');
const Articles = require('./routes/Articles');
const Admin = require('./routes/Admin');
const LPM = require('./controllers/lpm');

global.StopWords = LPM.readArrayFromFile('./controllers/StopWordsArray.txt');;
global.SI1 = {};
global.SI2 = {};
global.SI3 = {};
global.SI4 = {};
global.SI5 = {};

const isAuth = (req,res,next)=>{
    if(req.session.isAuth){
        next();
    }else{
        res.redirect('/');
    }
}

const router = express.Router();
const session = require('express-session');
const MongoDBSession = require('connect-mongodb-session')(session);
const mongoURI = process.env.MDB_ACCESS;

const store = new MongoDBSession({
    uri: mongoURI,
    collection:'tblSessions',
});

app.use(
    session({
        secret:process.env.RT_HASH,
        resave:false,
        saveUninitialized:false,
        // secret:'helloworld',
        name:'session.tugarxiv.sid',
        sameSite:false,
        // secure: process.env.IN_PROD,
        store:store,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 30 //30 days
        }
    })
);


function loadSearchIndex(){
    return new Promise((resolve,reject)=>{
        let s1 = new Promise ((resolve, reject)=>{
            fs.readFile('../ImportDB/SI1.json', (err, data) => {
                if (!err){
                    SI1 = JSON.parse(data);
                    console.log('Data read from file 1');
                    resolve(true);
                }       
            });
        }); 
        let s2 = new Promise ((resolve, reject)=>{
            fs.readFile('../ImportDB/SI2.json', (err, data) => {
                if (!err){
                    SI2 = JSON.parse(data);
                    console.log('Data read from file 2');
                    resolve(true);
                }       
            });
        }); 
        let s3 = new Promise ((resolve, reject)=>{
            fs.readFile('../ImportDB/SI3.json', (err, data) => {
                if (!err){
                    SI3 = JSON.parse(data);
                    console.log('Data read from file 3');
                    resolve(true);
                }       
            });
        }); 
        let s4 = new Promise ((resolve, reject)=>{
            fs.readFile('../ImportDB/SI4.json', (err, data) => {
                if (!err){
                    SI4 = JSON.parse(data);
                    console.log('Data read from file 4');
                    resolve(true);
                }       
            });
        }); 
        let s5 = new Promise ((resolve, reject)=>{
            fs.readFile('../ImportDB/SI5.json', (err, data) => {
                if (!err){
                    SI5 = JSON.parse(data);
                    console.log('Data read from file 5');
                    resolve(true);
                }       
            });
        }); 

        Promise.all([s1,s2,s3,s4,s5]).then(() => {
            resolve(true);
        });
    });
}

MongoDb.connect();

app.get('/',(req,res,next)=>{
    var ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
    let hdr = req.headers.host;
    console.log(ip);
    if(hdr.includes('admin.tugarxiv.tk')){
        res.redirect('/admin');
        // res.sendFile(path.join(__dirname,'/_admin/index.html'));
    }else{
        res.sendFile(path.join(__dirname,'/_public/index.html'));
    }
    app.use(express.static(__dirname + '/_admin'));
    app.use(express.static(__dirname + '/_public'));
    app.use('/',Root);
    app.use('/users',Users);
    app.use('/search',Search);
    app.use('/favorites',isAuth,Favorites);
    app.use('/articles',Articles);
    app.use('/admin',Admin);

    // if(req.session.viewCount){
    //     req.session.viewCount++;
    // }else{
    //     req.session.viewCount = 1;
    // }
    // res.sendFile(path.join(__dirname,'/_public/index.html'));
})




app.listen(PORT,async ()=>{
    console.log('Express Server running on port ' + PORT); 
});

module.export = {SI1}
