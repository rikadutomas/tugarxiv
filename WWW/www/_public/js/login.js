function toglePassView(el='',im=''){
    let pass;
    let pass_img;
    if(el==''){
        pass = document.getElementById('login-password');
        pass_img = document.getElementById('pass-img');
    }else{
        pass = document.getElementById(el);
        pass_img = document.getElementById(im);
    }
    
    if(pass.type=='password'){
        pass.type='text';
        pass_img.src = '../icons/hide_pass.png'
    }else{
        pass.type = 'password';
        pass_img.src = '../icons/view_pass.png'
    }
}


async function runLogin(){
    let email = document.getElementById('login-email').value;
    let password = document.getElementById('login-password').value;
    let errmsg = document.getElementById('err-msg');
    console.log(email);
    console.log(password);
    await fetch('/users/login', {
        method:'post',
        body: JSON.stringify({
            email:email,
            password:password
        }),
        headers: {
            "Content-Type" : "application/json; charset=utf-8"
        }
    }).then((response)=>{
        return response.json();
    }).then((qry)=>{
        if(qry.result=='ok'){
            window.open('/','_self')
        }else{
            errmsg.textContent = qry.result;
        }
    }).catch((err)=>{
        console.log(err);
        errmsg.textContent = 'Error connecting server. Please try again later';
    })
}

async function signUp(){
    let email = document.getElementById('login-email').value;
    let name = document.getElementById('login-name').value;
    let errmsg = document.getElementById('err-msg');
    let chkterms = document.getElementById('chkterms').checked;
    if(!chkterms){
        errmsg.textContent = 'You must accept the Terms and Privacy Policy to continue';
        return;
    }
    console.log('xxx' + chkterms);
    await fetch('/users/signup', {
        method:'post',
        body: JSON.stringify({
            email:email,
            name:name
        }),
        headers: {
            "Content-Type" : "application/json; charset=utf-8"
        }
    }).then((response)=>{
        return response.json();
    }).then((qry)=>{
        console.log(qry.result);
        if(qry.result=='ok'){
            console.log('ok')
            window.open('/signupcomplete','_self')
        }else{
            errmsg.textContent = qry.result;
        }
    }).catch((err)=>{
        console.log(err);
        errmsg.textContent = 'Error connecting server. Please try again later';
    })
}

async function forgotPsw(){
    let email = document.getElementById('login-email').value;
    let errmsg = document.getElementById('err-msg');

    await fetch('/users/forgotPass', {
        method:'post',
        body: JSON.stringify({
            email:email
        }),
        headers: {
            "Content-Type" : "application/json; charset=utf-8"
        }
    }).then((response)=>{
        return response.json();
    }).then((qry)=>{
        console.log(qry.result);
        if(qry.result=='ok'){
            console.log('ok')
            window.open('/signupcomplete','_self')
        }else{
            errmsg.textContent = qry.result;
        }
    }).catch((err)=>{
        console.log(err);
        errmsg.textContent = 'Error connecting server. Please try again later';
    })
}

async function runChangePass(){
    let currentpsw = document.getElementById('login-password-current').value
    let newpsw = document.getElementById('login-password').value
    let confirmpsw = document.getElementById('login-password-confirm').value
    let errmsg = document.getElementById('err-msg');
    if(currentpsw==''||newpsw==''||confirmpsw==''){
        errmsg.textContent = 'All fields are mandatory';
        return;
    }
    if(newpsw!=confirmpsw){
        errmsg.textContent = 'Passwords do not match';
        return;
    }
    if(newpsw==currentpsw){
        errmsg.textContent = 'Current and New Password are the same';
        return;
    }
    await fetch('/users/changePass', {
        method:'post',
        body: JSON.stringify({
            currentpsw:currentpsw,
            newpsw:newpsw
        }),
        headers: {
            "Content-Type" : "application/json; charset=utf-8"
        }
    }).then((response)=>{
        return response.json();
    }).then((qry)=>{
        console.log(qry.result);
        if(qry.result=='ok'){
            window.open('/changePassComplete','_self');
        }else{
            errmsg.textContent = qry.result;
        }
    }).catch((err)=>{
        console.log(err);
        errmsg.textContent = 'Error connecting server. Please try again later';
    })
}
async function runModifyEmail(){
    let newemail = document.getElementById('inemail').value
    let errmsg = document.getElementById('err-msg');
    console.log(newemail);
    if(newemail==''){
        errmsg.textContent = 'Email is mandatory';
        return;
    }
    await fetch('/users/modifyEmail', {
        method:'post',
        body: JSON.stringify({
            email:newemail
        }),
        headers: {
            "Content-Type" : "application/json; charset=utf-8"
        }
    }).then((response)=>{
        return response.json();
    }).then((qry)=>{
        console.log(qry.result);
        if(qry.result=='ok'){
            window.open('/modifyEmailComplete','_self');
        }else{
            errmsg.textContent = qry.result;
        }
    }).catch((err)=>{
        console.log(err);
        errmsg.textContent = 'Error connecting server. Please try again later';
    })
}

async function runDeleteAccount(){
    let password = document.getElementById('login-password-current').value
    let errmsg = document.getElementById('err-msg');
    if(password==''){
        errmsg.textContent = 'Password is mandatory';
        return;
    }
    await fetch('/users/removeAccount', {
        method:'post',
        body: JSON.stringify({
            password:password
        }),
        headers: {
            "Content-Type" : "application/json; charset=utf-8"
        }
    }).then((response)=>{
        return response.json();
    }).then((qry)=>{
        console.log(qry.result);
        if(qry.result=='ok'){
            window.open('/cyalater','_self');
        }else{
            errmsg.textContent = qry.result;
        }
    }).catch((err)=>{
        console.log(err);
        errmsg.textContent = 'Error connecting server. Please try again later';
    })
}

