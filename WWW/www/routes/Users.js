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
const EmailTuga = process.env.EMAIL;
const nodemailer = require ('nodemailer');
const smtp = require('../controllers/smtp');

const isAuth = (req,res,next)=>{
    if(req.session.isAuth){
        next();
    }else{
        res.json({result:'error'});
    }
}

router.post('/signup',(req,res)=>{
    const {name,email} = req.body;
    if(name==''||email==''){
        return res.json({result:'All fields are mandatory'});
    }
    if(!validateEmail(email)){
        return res.json({result:'All fields are mandatory'});
    }
    UserModel.findOne({email:email})
    .then(async (data)=>{
        if(data!=null){
            return res.json({result:'Account Already Exists'});
        }
        else{
            var password = Math.random().toString(36).slice(-8);
            const hashPsw = await bcrypt.hash(password,10);
            let user = new UserModel({
                name:name,
                email:email,
                password:hashPsw
            });
            await smtp.sendEmail(name,email,password)
            .catch((error)=>{
                console.log('ERROR>>>> ' + error)
                return res.json({result:'Unable to send Email'}); 
            });
            user.save()
            .then((out)=>{
                return res.json({result:'ok'});
            })
            .catch((err)=>{
                console.log(err);
                return res.json({result:'Connection Error: Please try again later'})
            });
        }
    })
    .catch((err)=>{
        return res.json({result:'Connection Error: Please try again later'})
    });  
});

router.post('/login',(req,res)=>{
    const {email,password} = req.body;
    UserModel.findOne({email:email})
    .then(async (data)=>{
        if(!data){
            return res.send({result:"Invalid Email / Password"});
        }
        else{
            const isMatch = await bcrypt.compare(password,data.password);
            if(!isMatch){
                return res.send({result:"Invalid Email / Password"});  
            }
            else{
                const hashEmail = await strEncode(email);
                req.session.isAuth = true;
                req.session.email = hashEmail;
                req.session.uname = nameLetters(data.name);
                res.send({result:'ok'});
            }
        }
    })
    .catch((err)=>{
        console.log(err);    
        return res.send('Connection Error: Please try again later')
    });
});



router.get('/logout',isAuth,(req,res)=>{
    req.session.destroy((err)=>{
        if(err) throw err;
        res.redirect('/logout');
    })
});

router.post('/forgotPass',(req,res)=>{
    const {email} = req.body;
    if(email==''){
        return res.json({result:'All fields are mandatory'});
    }
    if(!validateEmail(email)){
        return res.json({result:'All fields are mandatory'});
    }
    UserModel.findOne({email:email})
    .then(async (data)=>{
        if(!data){
            return res.json({result:'OK'});;
        }
        var password = Math.random().toString(36).slice(-8);
        const hashPsw = await bcrypt.hash(password,10);
        
        UserModel.findOneAndUpdate({email:email},{password:hashPsw})
        .then(async ()=>{
            await smtp.sendEmail(data.name,email,password).then((result)=>{
                return res.json({result:'ok'});
            }).catch((error)=>{
                console.log('ERROR>>>> ' + error)
                return res.json({result:'Unable to send Email'}); 
            });  
        })
        .catch((err)=>{
            console.log(err);
            return res.send('Connection Error: Please try again later')
        })
    });
});

router.post('/changePass',isAuth,async (req,res)=>{
    let {email} = req.session;
    let {currentpsw,newpsw} = req.body;
    email = strDecode(email);
    let user = await UserModel.findOne({email:email});
    let isMatch = await bcrypt.compare(currentpsw,user.password);
    if(user==null||!isMatch){
        return res.json({result:'Information provided do not allow to change the password'});
    }
    let hashPsw = await bcrypt.hash(newpsw,10);
    await UserModel.findOneAndUpdate({email:email},{password:hashPsw,replacePass:'true'}).then(()=>{
        return res.json({result:'ok'});
    })
    .catch((err)=>{
        console.log(err)
    });
});

router.post('/removeAccount',isAuth,async (req,res)=>{
    let password = req.body.password;
    let email = req.session.email;
    if(password==''){
        return res.send('Password is mandatory');
    }
    email = strDecode(email);
    let user = await UserModel.findOne({email:email})
    if(user==null){
        return res.send('Unable to delete account. Please reach us through Contact Us');
    }
    let isMatch = bcrypt.compare(password,user.password);
    if(!isMatch){
        return res.send('Password is invalid');
    }
    UserModel.findOneAndDelete({email:email})
    .then(()=>{
        req.session.destroy();
        return res.json({result:'ok'})    
    });
    
});

router.post('/isauth',async (req,res)=>{
    if(req.session.isAuth){
        let uname = req.session.uname;
        res.send(
            {
                result:true,
                initials:uname
            }
        );
    }else{
        res.send({result:false});
    }
});




router.post('/modifyEmail',isAuth,async (req,res)=>{
    let email = req.session.email;
    let newemail = req.body.email;
    if(!validateEmail(newemail)||newemail==''){
        return res.send('Invalid Email');
    }
    let data = await UserModel.findOne({email:newemail});
    if(data!=null){
        return res.send('Invalid Email');
    }
    email = strDecode(email);
    UserModel.findOneAndUpdate({email:email},{email:newemail})
    .then((data)=>{
        req.session.email = strEncode(newemail);
        return res.json({result:'ok'});
    })
    .catch((err)=>{
        console.log(err);
        return res.json({result:'Unable to modify email at this moment'});
    });
});


router.post('/savefavorites',isAuth,async (req,res)=>{
    let email = strDecode(req.session.email);
    let favorites = req.body.favorites;
    favorites = JSON.stringify(favorites);
    UserModel.findOneAndUpdate({email:email},{favorites:favorites})
    .then((data)=>{
        return res.json({result:'ok'});
    })
    .catch((err)=>{
        return res.json({result:'Unable to modify email at this moment'});
    });
});

router.post('/loadfavorites',isAuth,async (req,res)=>{
    let email = strDecode(req.session.email);
    UserModel.findOne({email:email})
    .then((data)=>{
        return res.json(JSON.parse(data.favorites));
    })
    .catch((err)=>{
        return res.json({result:'Unable to reach server'});
    });
});


router.post('/savenote',isAuth,async (req,res)=>{
    let email = strDecode(req.session.email);
    let note = req.body;
    let usr = await UserModel.findOne({email:email});
    if(!usr){
        return res.json({result:'err'}); 
    }
    
    let usrnotes = usr.notes
    let exists = false;
    for(let x=0;x<usrnotes.length;x++){
        if(usrnotes[x].doi==note.doi){
            exists = true;
            usrnotes[x].content = note.content;
            break;
        }
    }
    if(!exists){
        let obj = {
            doi:note.doi,
            content:note.content
        }
        usrnotes.push(obj);
    }
    await UserModel.findOneAndUpdate({email:email},{notes:usrnotes})
    .then((qry)=>{
        return res.json({
            result:'ok',
            value:qry
        })
    })
    .catch((err)=>{
        console.log(err);
    });
    
})

router.post('/getnote',isAuth,async (req,res)=>{
    let email = strDecode(req.session.email);
    let doi = req.body.doi;
    let usr = await UserModel.findOne({email:email});
    if(!usr){
        return res.json({result:'err'}); 
    }
    let usrnotes = usr.notes
    let exists = false;
    for(let x=0;x<usrnotes.length;x++){
        if(usrnotes[x].doi==doi){
            exists = true;
            return res.json({
                result:'ok',
                value:usrnotes[x].content
            })
        }
    }
    return res.json({
        result:'ok',
        value:''
    })
})

router.get('/getfaqs',async (req,res)=>{
    await FaqModel.find().sort({faq_id:1})
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

router.post('/contactus',async (req,res)=>{
    let name= req.body.name;
    let email = req.body.email;
    let subject = req.body.subject;
    let description = req.body.description;

    await smtp.sendContactUs(name,email,subject,description).then((r)=>{
        console.log(r);
        return res.json({result:'ok'});
    })
    .catch((error)=>{
        console.log('ERROR>>>> ' + error)
        return res.json({result:'Unable to send Email'}); 
    });

})


//=========================== Functions=================================

function nameLetters(name){
    let arr = name.split(" ");
    if(arr.length>1){
        let a = arr[0].charAt(0);
        let x = a + arr[arr.length-1].charAt(0);
        let z = x.toUpperCase();
        return z;
    }else{
        return arr[0].charAt(0).toUpperCase();
    }
}

function validateEmail(mail){
    var mailformat = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    if(mail.match(mailformat)){
        return true;
    }
    else{
        return false;
    }
}

function validatePassword(psw){
    const passformat = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
    if(psw.match(passformat)){
        return true;
    } 
    else{
        return false;
    } 
}

function strEncode(str){
    const buff = Buffer.from(str, 'utf-8');
    return buff.toString('base64');
}

function strDecode(str){
    const buff = Buffer.from(str, 'base64');
    return buff.toString('utf-8');
}


module.exports = router;






