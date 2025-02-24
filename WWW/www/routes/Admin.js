require('dotenv').config()
const express = require('express');
const router = express.Router();
const path = require('path');
const bcrypt = require('bcryptjs');
const UserModel = require('../models/UserModel');
const FaqModel = require('../models/Faqs');
const session = require('express-session');
const MongoDBSession = require('connect-mongodb-session')(session);
const mongoURI = process.env.MDB_ACCESS;
const nodemailer = require ('nodemailer');
const smtp = require('../controllers/smtp');

const isAuth = async (req,res,next)=>{
    if(req.session.isAuth){
        let valid = await validateAdminUser(req.session.email);
        if(valid){
            next();
        }else{
            res.redirect('/admin/login');
        } 
    }else{
        res.redirect('/admin/login');
    }
}

async function validateAdminUser(email){
    email = strDecode(email);
    let data = await UserModel.findOne({email:email}).catch((err)=>{return res.json({result:'Unable to reach server'});});;
    if(data){
        if(data.profile=='admin'){
            return true
        }
        else{
            return false
        }
    }
} 

router.get('/',isAuth,(req,res)=>{
    res.sendFile(path.join(__dirname,'../_admin/index.html'));
})

router.get('/login',(req,res)=>{
    res.sendFile(path.join(__dirname,'../_admin/admin_html/login.html'));
})

router.get('/terminatesession',isAuth,(req,res)=>{
    req.session.destroy((err)=>{
        if(err) throw err;
        res.redirect('/admin/logout');
    })
});


router.get('/logout',(req,res)=>{
    res.sendFile(path.join(__dirname,'../_admin/admin_html/logout.html'));
})

router.post('/getfaqs',isAuth,async (req,res)=>{
    await FaqModel.find()
    .then((qry)=>{
        return res.json({
            result:'ok',
            value:qry
        })
    }).catch((err)=>{
        console.log(err);
        return res.json({result:'err'})
    })

})

router.post('/savefaqs',isAuth,async (req,res)=>{
    let faq_id = req.body.faq_id;
    let question = req.body.question;
    let answer = req.body.answer;

    let f = await FaqModel.find({faq_id:faq_id}).catch((err)=>{console.log(err)});
    if(f.length>0){
        await FaqModel.findAndUpdate({faq_id:faq_id}).catch((err)=>{console.log(err)});
        return res.json({result:'ok'});
    }else{
        let sv = new FaqModel({
            faq_id:faq_id,
            question:question,
            answer:answer
        })
        sv.save();
        return res.json({result:'ok'});
    }
});

router.post('/deletefaq',isAuth,async (req,res)=>{
    let faq_id = req.body.faq_id;
    let r = await FaqModel.findOneAndDelete({faq_id:faq_id}).catch((err)=>{console.log(err)});
    if(!r){
        return res.json({
            result:'err',
            value:'Error : Record doesnt exist'
        });
    }else{
        return res.json({
            result:'ok'
        }); 
    }
});


router.post('/getusers',isAuth,async (req,res)=>{
    await UserModel.find()
    .then((qry)=>{
        return res.json({
            result:'ok',
            value:qry
        })
    }).catch((err)=>{
        console.log(err);
        return res.json({result:'err'})
    })

})

router.post('/togglerole',isAuth,async (req,res)=>{
    let email=req.body.email;
    let user = await UserModel.findOne({email:email}).catch((err)=>{console.log(err)});
    let newState;
    if(user.profile=='admin'){
        newState='user';
    }else{
        newState='admin';
    }
    UserModel.findOneAndUpdate({email:email},{profile:newState})
    .then(()=>{
        return res.json({result:'ok',value:newState})
    })
    .catch((err)=>{console.log(err)});
})


router.post('/dropUser',isAuth,async (req,res)=>{
    let email = req.body.email;
    UserModel.findOneAndDelete({email:email})
    .then(()=>{
        return res.json({result:'ok'})    
    });
});


function strDecode(str){
    const buff = Buffer.from(str, 'base64');
    return buff.toString('utf-8');
}


module.exports = router;