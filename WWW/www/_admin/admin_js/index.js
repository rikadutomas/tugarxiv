import * as HTML from './html.mjs'

var users;
var Faqs;

function SidebarBtnSelect(btnName){
    document.querySelectorAll('.admin-shortcuts-btn').forEach(qry=>{
        if(qry.textContent==btnName){
            qry.classList.add('admin-shortcuts-btn-selected');
        }else{
            qry.classList.remove('admin-shortcuts-btn-selected')
        }
    })
}

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

async function saveFaqs(){
    await fetch('/admin/savefaqs', {
        method:'post',
        body: JSON.stringify({
        }),
        headers: {
            "Content-Type" : "application/json; charset=utf-8"
        }
    }).then((response)=>{
        return response.json();
    }).then((qry)=>{
        console.log(qry);
        if(qry.result=='ok'){
            return qry.value
        }
    }).catch((err)=>{
        console.log(err);
    })
}

async function getFaqs(){
    let out = await fetch('/admin/getfaqs', {
        method:'post',
        body: JSON.stringify({
        }),
        headers: {
            "Content-Type" : "application/json; charset=utf-8"
        }
    }).then((response)=>{
        return response.json();
    }).then((qry)=>{
        if(qry.result=='ok'){
            return qry.value
        }
    }).catch((err)=>{
        console.log(err);
    })
    return out;
}

async function getUsers(){
    let out = await fetch('/admin/getusers', {
        method:'post',
        body: JSON.stringify({
        }),
        headers: {
            "Content-Type" : "application/json; charset=utf-8"
        }
    }).then((response)=>{
        return response.json();
    }).then((qry)=>{
        if(qry.result=='ok'){
            return qry.value
        }
    }).catch((err)=>{
        console.log(err);
    })
    return out;
}

window.toggleRole = async(email)=>{
    await fetch('/admin/togglerole',{
        method:'post',
        body: JSON.stringify({
            email:email
        }),
        headers: {
            "Content-Type" : "application/json; charset=utf-8"
        }
    })
    .then((res)=>{
        return res.json();
    })
    .then((qry)=>{
        console.log(qry);
        if(qry.result=='ok'){
            getUsersHtml();
            return; 
        }
    })
    .catch((err)=>{
        console.log(err);
    });  
}

window.getMainHtml = ()=>{
    let out = HTML.htmlMain();
    SidebarBtnSelect('Main');
    document.getElementById('container').innerHTML = out;
}

function toggleRoleImg(role){
    if(role=='user'){
        return 'toggle_off.png'
    }else{
        return 'toggle_on.png'
    }
}

window.filterUsers = ()=>{
    let arr = [];
    let src = document.getElementById('searchemail').value;
    console.log(src)
    users.forEach(u=>{
        let lowsrc = src.toLowerCase();
        let lowemail = u.email.toLowerCase();
        let lowname = u.name.toLowerCase();
        if(lowemail.includes(lowsrc) || lowname.includes(lowsrc)){
            arr.push(u);
        }
    })
    console.log(arr);
    let out = `
        <tr>
            <th>Name</th> 
            <th>Email</th>
            <th>Registration</th>
            <th>Role</th>
            <th>Valid</th>
            <div class="delete-user">
            <th></th><th></th></div>
        </tr>
    `

    arr.forEach((u)=>{
        let imgSrc = toggleRoleImg(u.profile)
        let x = `
            <tr>
                <td>${u.name}</td>
                <td>${u.email}</td>
                <td>${u.date}</td>
                <td>${u.profile}</td>
                <td>${u.replacePass}</td>
                <td class="user-delete-btn-td"><div class="user-delete-btn" onclick="javascript:deleteAdminUser('${u.email}')"><img src="../admin_icons/delete.png" alt=""></div></td>
                <td class="user-delete-btn-td"><div class="user-role-btn" onclick="javascript:toggleRole('${u.email}')"><img src="../admin_icons/${imgSrc}" alt=""></div></td>
            </tr>
        `
        out = out + x;
    })
    document.getElementById('usertable').innerHTML = out;
}


window.getUsersHtml = async ()=>{
    let out = HTML.htmlUsers();
    SidebarBtnSelect('Users');
    document.getElementById('container').innerHTML = out;
    users = await getUsers();

    console.log(users);
    out = `
        <tr>
            <th>Name</th> 
            <th>Email</th>
            <th>Registration</th>
            <th>Role</th>
            <th>Valid</th>
            <div class="delete-user">
            <th></th><th></th></div>
        </tr>
    `

    users.forEach((u)=>{
        let imgSrc = toggleRoleImg(u.profile)
        let x = `
            <tr>
                <td>${u.name}</td>
                <td>${u.email}</td>
                <td>${u.date}</td>
                <td>${u.profile}</td>
                <td>${u.replacePass}</td>
                <td class="user-delete-btn-td"><div class="user-delete-btn" onclick="javascript:deleteAdminUser('${u.email}')"><img src="../admin_icons/delete.png" alt=""></div></td>
                <td class="user-delete-btn-td"><div class="user-role-btn" onclick="javascript:toggleRole('${u.email}')"><img src="../admin_icons/${imgSrc}" alt=""></div></td>
            </tr>
        `
        out = out + x;
    })

    document.getElementById('usertable').innerHTML = out;
}

function popupTrueFalse(question){
    return new Promise((resolve)=>{
        let modal=document.getElementById('modal');
        let out = `
            <div class="popup-container">
                <div class="popup-msg">${question}</div>
                <div class="popup-btn-container">
                    <button class="popup-btn btn-cancel" id="btncancel">Cancel</button>
                    <button class="popup-btn btn-submit" id="btnsubmit">Submit</button>
                </div>
            </div>
        `
        modal.style.display = "block";
        window.onclick = function(event) {
            if (event.target == modal) {
              modal.style.display = "none";
            }
        }
        modal.innerHTML = out;
        document.getElementById('btncancel').addEventListener('click',()=>{
            modal.style.display = "none";
            resolve(false);
        },{once:true});
        document.getElementById('btnsubmit').addEventListener('click',()=>{
            modal.style.display = "none";
            resolve(true);
        },{once:true});
    })
}
function popupWarning(question){
    return new Promise((resolve)=>{
        let modal=document.getElementById('modal');
        let out = `
            <div class="popup-container">
                <div class="popup-msg">${question}</div>
                <div class="popup-btn-container">
                    <button class="popup-btn btn-cancel" id="btnok">Ok</button>
                </div>
            </div>
        `
        modal.style.display = "block";
        window.onclick = function(event) {
            if (event.target == modal) {
              modal.style.display = "none";
            }
        }
        modal.innerHTML = out;
        document.getElementById('btnok').addEventListener('click',()=>{
            modal.style.display = "none";
            resolve(true);
        },{once:true});
    })
}

window.deleteAdminUser = async (email)=>{
    let res = await popupTrueFalse('Are you sure you want to delete User?');
    if(res){
        await fetch('/admin/dropUser',{
            method:'post',
            body: JSON.stringify({
                email:email
            }),
            headers: {
                "Content-Type" : "application/json; charset=utf-8"
            }
        })
        .then((res)=>{
            return res.json();
        })
        .then((qry)=>{
            console.log(qry);
            if(qry.result=='ok'){
                getUsersHtml();
                return true;
            }
        })
        .catch((err)=>{
            console.log(err);
        });
    }
      
}

window.faqSave = async ()=>{
    let id = document.getElementById('txtid').value;
    let q = document.getElementById('txtq').value;
    let a = document.getElementById('txta').value;
    let validId = isNumeric(id)
    let difId = true;

    if(id==''||q==''||a==''){
        popupWarning('Cannot submit blank fields');
    }else if(!validId){
        popupWarning('ID must be a number!!!');
    }else{
        await fetch('/admin/savefaqs',{
            method:'post',
            body: JSON.stringify({
                faq_id:id,
                question:q,
                answer:a
            }),
            headers: {
                "Content-Type" : "application/json; charset=utf-8"
            }
        })
        .then((res)=>{
            return res.json();
        })
        .then(async (qry)=>{
            await popupWarning('Faqs Updated');
        })
        .catch(async (err)=>{
            popupWarning('Error saving. Please try Later!!');
        });
    }
    getFaqHtml();
}

window.faqDelete = async ()=>{
    let id = document.getElementById('txtid').value;
    let validId = isNumeric(id)
    if(id==''){
        popupWarning('ID cannot be empty');
    }else if(!validId){
        popupWarning('ID must be a number!!!');
    }else{
        let res = await popupTrueFalse('Are you sure you want to delete User?');
        if(res){
            await fetch('/admin/deletefaq',{
                method:'post',
                body: JSON.stringify({
                    faq_id:id,
                }),
                headers: {
                    "Content-Type" : "application/json; charset=utf-8"
                }
            })
            .then((res)=>{
                return res.json();
            })
            .then(async (qry)=>{
                if(qry.result=='ok'){
                    await popupWarning('Faqs Updated');
                }else{
                    popupWarning(qry.value);
                }
            })
            .catch(async (err)=>{
                popupWarning('Error saving. Please try Later!!');
            });
        }
    }
    getFaqHtml();
}







// window.getStatisticsHtml = ()=>{
//     let out = HTML.htmlStatistics();
//     SidebarBtnSelect('Statistics');
//     document.getElementById('container').innerHTML = out;
// }

window.getFaqHtml = async ()=>{
    let out = HTML.htmlFaq();
    SidebarBtnSelect('FAQ Actualizer');
    document.getElementById('container').innerHTML = out;

    Faqs = await getFaqs();
    console.log(Faqs);
    out = `
        <tr>
            <th>ID</th>
            <th>Question</th>
            <th>Answer</th>
        </tr>
    `

    Faqs.forEach((f)=>{
        let x = `
            <div><tr class="faq-row" id="${f.faq_id}"><td>${f.faq_id}</td><td>${f.question}</td><td>${f.answer}</td></tr></div>
        `
        out = out + x;
    })

    document.getElementById('faqtable').innerHTML = out;

    document.querySelectorAll('.faq-row').forEach(r=>{
        r.addEventListener('click',(e)=>{
            Faqs.forEach(f=>{
                if(f.faq_id==r.id){
                    console.log(f)
                    document.getElementById('txtid').value = f.faq_id;
                    document.getElementById('txtq').value = f.question;
                    document.getElementById('txta').value = f.answer;
                }
            })
        })
    })
}

window.getLogOutHtml = ()=>{
    window.open("http://admin.tugarxiv.tk/admin/terminatesession","_self");
}

function main(){
    getMainHtml();
}

main()