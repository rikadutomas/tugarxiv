const express = require('express');
const router = express.Router();
const path = require('path');

router.get('/login',(req,res)=>{
    res.sendFile(path.join(__dirname,'../_public/html/login.html'));
})

router.get('/logout',(req,res)=>{
    res.sendFile(path.join(__dirname,'../_public/html/logout.html'));
})

router.get('/signup',(req,res)=>{
    res.sendFile(path.join(__dirname,'../_public/html/signup.html'));
})

router.get('/forgotpassword',(req,res)=>{
    res.sendFile(path.join(__dirname,'../_public/html/forgot.html'));
})

router.get('/changePass',(req,res)=>{
    res.sendFile(path.join(__dirname,'../_public/html/resetpass.html'));
})

router.get('/signupcomplete',(req,res)=>{
    res.sendFile(path.join(__dirname,'../_public/html/signupcomplete.html'))
})

router.get('/changePassComplete',(req,res)=>{
    res.sendFile(path.join(__dirname,'../_public/html/resetpasscomplete.html'))
})

router.get('/modifyEmail',(req,res)=>{
    res.sendFile(path.join(__dirname,'../_public/html/modifyemail.html'))
})

router.get('/modifyEmailComplete',(req,res)=>{
    res.sendFile(path.join(__dirname,'../_public/html/modifyemailcomplete.html'))
})

router.get('/deleteAccount',(req,res)=>{
    res.sendFile(path.join(__dirname,'../_public/html/deleteaccount.html'))
})

router.get('/cyalater',(req,res)=>{
    res.sendFile(path.join(__dirname,'../_public/html/cyalater.html'));
})

router.get('/faq',(req,res)=>{
    res.sendFile(path.join(__dirname,'../_public/html/faq.html'));
})

router.get('/about',(req,res)=>{
    res.sendFile(path.join(__dirname,'../_public/html/about.html'));
})

router.get('/contactus',(req,res)=>{
    res.sendFile(path.join(__dirname,'../_public/html/contactus.html'));
})

module.exports = router;