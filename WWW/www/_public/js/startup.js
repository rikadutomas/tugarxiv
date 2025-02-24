import * as EventListeners from './eventListeners.mjs';
// import * as categories from './categories.mjs';
// var categories_biorxiv;
// var categories_medrxiv;
var session = false;
var optionsMenuState;
// var frame = window.innerHeight;

document.getElementById('main').style.height = (window.innerHeight-85)+'px';
if(document.getElementById('sidebar-content')){
    document.getElementById('sidebar-content').style.height = (window.innerHeight-130-85)+'px';
}


window.addEventListener('resize',()=>{
    document.getElementById('main').style.height = (window.innerHeight-85)+'px';
    if(document.getElementById('sidebar-content')){
        document.getElementById('sidebar-content').style.height = (window.innerHeight-130-85)+'px';
    }
})

function isUser(state,initials=''){
    console.log('Is User runned...')
    let isUser = `
    <div class="nav-links">
        <a href="/favorites">
            Favorites
        </a>
    </div>
    <div class="nav-login" id="navlogin">
        <a href="javascript:toggleOptionsMenu()">
            ${initials}
        </a>
    </div>
    `
    let isNotUser = `
    <div class="nav-login">
        <a href="/login" onclick="/users/login">
        <img src="./icons/login.png" alt="">
        </a>
    </div>
    `
    if(state) return isUser;
    else return isNotUser;
}

window.toggleOptionsMenu = ()=>{
    let UserOptions = document.getElementById('useroptions');
    if(optionsMenuState){
        optionsMenuState=false;
        UserOptions.style.visibility = 'hidden';
        
    }else{
        optionsMenuState=true;
        UserOptions.style.visibility = 'visible';
        window.addEventListener('click',(e)=>{
            if(!UserOptions.contains(e.target)){
                toggleOptionsMenu();
            }
        },{once:true})
    }
}

async function main(){
    session = await EventListeners.validSession();
    if(session.result==true){
        document.getElementById('navusersbtn').innerHTML = isUser(true,session.initials);
    }else{
        document.getElementById('navusersbtn').innerHTML = isUser(false);
    }
};

//Loading Process
main();