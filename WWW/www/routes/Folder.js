const express = require('express');
const router = express.Router();
const UserModel = require('../models/UserModel');



const isAuth = (req,res,next)=>{
    if(req.session.isAuth){
        next();
    }else{
        res.json({result:'error'});
    }
}



router.post('/addFolder',isAuth,(req,res)=>{
    const email = strDecode(req.session.email);
    const favorites = req.body.favorites; 
    res.send('Folder Added!');
});



router.post('/renameFolder',isAuth,(req,res)=>{
    const email = strDecode(req.session.email);
    const favorites = req.body.favorites; 
    res.send('Folder Renamed!');
});



router.post('/deleteFolder',isAuth,(req,res)=>{
    const email = strDecode(req.session.email);
    const favorites = req.body.favorites; 
    res.send('Folder Deleted!');
});