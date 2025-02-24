const express = require('express');
const router = express.Router();
const path = require('path');
const UserModel = require('../models/UserModel');
const session = require('express-session');
const MongoDBSession = require('connect-mongodb-session')(session);
const mongoURI = process.env.MDB_ACCESS;


const isAuth = (req,res,next)=>{
    if(req.session.isAuth){
        next();
    }else{
        res.json({result:'error'});
    }
}


router.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,'../_public/html/search.html'))
})


router.post('/addFavorite',isAuth,(req,res)=>{
    const email = strDecode(req.session.email);
    const favorites = req.body.favorites; 


    res.send('Favorite Added!');
});



router.post('/deleteFavorite',isAuth,(req,res)=>{
    const email = strDecode(req.session.email);
    const favorites = req.body.favorites; 


    res.send('Favorite Deleted!');
});



router.post('/addCategories',isAuth, async (req,res)=>{
    const email = strDecode(req.session.email);
    const favorites = req.body.favorites; 
    res.send('Categorie Added!');
});




module.exports = router;