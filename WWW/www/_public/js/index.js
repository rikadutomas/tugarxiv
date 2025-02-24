import * as EventListeners from './eventListeners.mjs';
import * as categories from './categories.mjs';
import * as articleModules from './articleModules.mjs';

async function main(){
    
    // let catBiorxiv = JSON.parse(localStorage.getItem("cat_biorxiv") || "[]");
    EventListeners.EventLoad();
    await categories.buildCategoriesArray().then(()=>{
        categories.cat_biorxiv();
    })
    await articleModules.getRecentArticles();
};

//Loading Process
main();




