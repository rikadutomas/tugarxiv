require('dotenv').config()
const fs = require('fs');
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS; 

var nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
});

function randomId(){
    let rnd = Math.random().toString(36).substr(2, 4);
    return rnd
}

function sendEmail(name,email,psw) {
    let emailBody = `
            <p style="font-family: Arial, Helvetica, sans-serif;">Hello ${name}</p>
            <br>
            <p style="font-family: Arial, Helvetica, sans-serif;">Below you can find the password to access on your tugaRxiv personal space (http://www.tugarxiv.tk/login).</p>
            <p style="font-family: Arial, Helvetica, sans-serif;">After your first access you can change it by doing the following steps:</p>
            <ul>
                <li style="font-family: Arial, Helvetica, sans-serif;">Click on your User button (top left corner of the page)</li>
                <li style="font-family: Arial, Helvetica, sans-serif;">Click "Change Password"</li>
                <li style="font-family: Arial, Helvetica, sans-serif;">Follow the steps as requested</li>
            </ul>
            <br>
            <p style="font-family: Arial, Helvetica, sans-serif;">Here is the password:</p>
            <h2 style="font-family: Arial, Helvetica, sans-serif;">${psw}</h2>
            <p style="font-family: Arial, Helvetica, sans-serif;">If you need further assistance please don't hesitate on reach us using "Contact Us"</p>
            <p style="font-family: Arial, Helvetica, sans-serif;">Your's truly</p>
            <h3 style="font-family: Arial, Helvetica, sans-serif;">tugaRxiv</h3>
        `

    let mailOptions = {
        from: '"tugaRxiv" <tugarxiv@gmail.com>',
        to: email,
        subject: 'Welcome to tugaRxiv',
        html: emailBody
    };
    
    return new Promise((resolve, reject) => {

        transporter.sendMail(mailOptions, (error, result) => {
            if (error) return reject(error);
            return resolve(result);
        });
    });
}

function sendContactUs(name,email,subject,description) {
    let emailBody = `
            <p>Name: ${name}</p>
            <p>Email: ${email}</p>
            <p>Subject: ${subject}</p>
            <p>Description</p>
            <p>${description}</p>
        `

    let mailOptions = {
        from: '"tugaRxiv Customer Support" <tugarxiv@gmail.com>',
        to: 'tugarxiv@gmail.com',
        subject: 'CONTACT US: ',
        html: emailBody
    };
    
    return new Promise((resolve, reject) => {

        transporter.sendMail(mailOptions, (error, result) => {
            if (error) return reject(error);
            return resolve(result);
        });
    });
}

module.exports = {sendEmail,sendContactUs};

