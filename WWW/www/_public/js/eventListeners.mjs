import * as categories from './categories.mjs';
import * as articleModules from './articleModules.mjs';
var uname = '';

function EventLoad(){
    document.getElementById('btn-main-bio').addEventListener('click',()=>{
        document.getElementById('btn-main-bio').classList.add("btn-index-categories-selected");
        document.getElementById('btn-main-med').classList.remove("btn-index-categories-selected");
        categories.cat_biorxiv();
    
    });
    document.getElementById('btn-main-med').addEventListener('click',()=>{
        document.getElementById('btn-main-med').classList.add("btn-index-categories-selected");
        document.getElementById('btn-main-bio').classList.remove("btn-index-categories-selected");
        categories.cat_medrxiv()
    });
    
    document.getElementById('btn-most_recent').addEventListener('click',async ()=>{
        document.getElementById('btn-most_recent').classList.add("btn-index-results-selected");
        document.getElementById('btn-most-viewed').classList.remove("btn-index-results-selected");
        document.getElementById('btn-main-statistics').classList.remove("btn-index-results-selected");
        await articleModules.getRecentArticles();
    });
    
    document.getElementById('btn-most-viewed').addEventListener('click',()=>{
        document.getElementById('btn-most_recent').classList.remove("btn-index-results-selected");
        document.getElementById('btn-most-viewed').classList.add("btn-index-results-selected");
        document.getElementById('btn-main-statistics').classList.remove("btn-index-results-selected");
        articleModules.getMostViewedArticles();
    });
    
    document.getElementById('btn-main-statistics').addEventListener('click',()=>{
        document.getElementById('btn-most_recent').classList.remove("btn-index-results-selected");
        document.getElementById('btn-most-viewed').classList.remove("btn-index-results-selected");
        document.getElementById('btn-main-statistics').classList.add("btn-index-results-selected");
        articleModules.getIndexStatistics();
    });
}

function validSession(){
    return new Promise((resolve,reject)=>{
        fetch('/users/isauth', {
            method:'post',
            body: JSON.stringify({
            }),
            headers: {
                "Content-Type" : "application/json; charset=utf-8"
            }
        }).then((response)=>{
            return response.json();
        }).then((qry)=>{
            resolve(qry);
        }).catch((err)=>{
            console.log(err);
            reject(err);
        });
    });
}

export {validSession,EventLoad};