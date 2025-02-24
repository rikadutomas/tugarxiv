import * as categories from './categories.mjs'


function runClearSearch(){
    document.getElementById('fld_search').value = '';
    document.getElementById('fld_bio').checked = false;
    document.getElementById('fld_med').checked = false;
    document.getElementById('fld_date_start').value = '';
    document.getElementById('fld_date_end').value = '';
    document.getElementById('fld_category').value = '';
    document.getElementById('fld_author').value = '';
    document.getElementById('fld_title').value = '';
    document.getElementById('fld_abstract').value = '';
}

function getCboList(){
    let bio = document.getElementById('fld_bio').checked;
    let med = document.getElementById('fld_med').checked;
    let arr;
    let out = '<option value=""></option>';

    if(bio&&!med){
        arr = categories.buildCboCategories('biorxiv');
    }else if(!bio&&med){
        arr = categories.buildCboCategories('medrxiv');
    }else{
        arr = categories.buildCboCategories();
    }

    arr.forEach(element => {
        out = out + ('<option value="'+element+'">'+element+'</option>')
    });
    return out;
}

function loadCboCategories(){
    let lst = getCboList();
    document.getElementById('fld_category').innerHTML = lst;
}

function onLoad(){
    document.getElementById('btn-advclear').addEventListener('click',()=>{
        runClearSearch();
    })
    // document.getElementById('btn-advsearch').addEventListener('click',()=>{
    //     runAdvancedSearch();
    // })
    document.getElementById('doi-submit').addEventListener('click',()=>{
        showArticleDoi();
    })

    document.getElementById('fld_bio').addEventListener('click',()=>{
        let lst = getCboList();
        document.getElementById('fld_category').innerHTML = lst;
    })
    document.getElementById('fld_med').addEventListener('click',()=>{
        let lst = getCboList();
        document.getElementById('fld_category').innerHTML = lst;
    })

    loadCboCategories();

}

export {onLoad};