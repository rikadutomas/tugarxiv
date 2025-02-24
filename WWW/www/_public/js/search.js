import * as ArticleView from './articleview.mjs';
import * as SidebarView from './sidebarView.mjs';
import * as SidebarModule from './sidebarModule.mjs';
import * as categories from './categories.mjs'
import * as Tree from './tree.mjs'
import * as EventListeners from './eventListeners.mjs';

const SearchPage = document.getElementById('container-results');
const SidebarContent = document.getElementById('sidebar-content');
const SidebarBtnSearch = document.getElementById('btn-search');
const SidebarBtnFolders = document.getElementById('btn-folders');
const ContainerTitle = document.getElementById('container-title');
var session = false;
var PageQry;
var VrelatedResults = [];
var Vdoi = '';
var Mdoi = '';
var personalNotes = '';
var otherVersions = [];

function btnSearchLoad(){
    SidebarBtnSearch.classList.add('btn-selected');
    SidebarBtnFolders.classList.remove('btn-selected');
    ContainerTitle.innerHTML = '<div class="title-fav">Search</div>';
    document.getElementById('container-results').innerHTML = '';
    SidebarContent.innerHTML = SidebarView.loadSearchSidebar();
    document.querySelectorAll('.enter-exec').forEach((q)=>{
        q.addEventListener('keypress',(e)=>{
            if (e.key === 'Enter') {
                runAdvancedSearch();
            }
        });
    })
}

function btnTreeLoad(){
    SidebarBtnSearch.classList.remove('btn-selected');
    SidebarBtnFolders.classList.add('btn-selected');
    ContainerTitle.innerHTML = '<div class="title-fav">Favorites</div>';
    SidebarContent.innerHTML = SidebarView.loadTreeSidebar();
    Tree.load();
}

SidebarBtnSearch.addEventListener('click',()=>{
    btnSearchLoad();
});
SidebarBtnFolders.addEventListener('click',()=>{
    btnTreeLoad();
});

document.getElementById('sidebar-content').style.height = (window.innerHeight-50-85)+'px';
window.addEventListener('resize',()=>{
        document.getElementById('sidebar-content').style.height = (window.innerHeight-50-85)+'px';
        if(document.getElementById('related-content')){
            let container = document.getElementById('container').clientHeight;
            let containertitle = document.getElementById('container-title').clientHeight;
            let resultsarticle = document.getElementById('results-article').clientHeight;
            let relatedtop = document.getElementById('related-top').clientHeight;
            document.getElementById('related-content').style.height = (container-containertitle-resultsarticle-relatedtop-10)+'px';
        }
})

function runResize(){
    if(document.getElementById('related-content')){
        let container = document.getElementById('container').clientHeight;
        let containertitle = document.getElementById('container-title').clientHeight;
        let resultsarticle = document.getElementById('results-article').clientHeight;
        let relatedtop = document.getElementById('related-top').clientHeight;
        document.getElementById('related-content').style.height = (container-containertitle-resultsarticle-relatedtop-10)+'px';
    }
}

function DoiArticle(doi_id){
    let arr=doi_id.split('.');
    if(arr.length > 2){
        let out = arr[0];
        for(let x=1;x<arr.length-1;x++){
            out = out + '.' + arr[x];
        }
        return out;
    }else{
        return arr[0]
    }
}

async function searchCategory(category){
    SearchPage.innerHTML = ArticleView.multipleResultsContainer();
    document.getElementById('searchresults-container').innerHTML = 'Processing your request. Please wait...';
    ContainerTitle.innerHTML = `<div class="title-fav">Search by Category</div><div class="title-fav title-separator"> > </div><div class="title-fav">${category}</div>`;
    await fetch('/search/searchcategory', {
        method:'post',
        body: JSON.stringify({
            category:category
        }),
        headers: {
            "Content-Type" : "application/json; charset=utf-8"
        }
    }).then((response)=>{
        return response.json();
    }).then((qry)=>{
        if(qry.result=='ok'){
            console.log(qry.list)
            PageQry = qry.list;
            console.log(PageQry);
            SearchPage.innerHTML = ArticleView.multipleResultsContainer();
            let out = '';
            // console.log(qry);
            qry.value.forEach((q)=>{
                let o = ArticleView.htmlViewRelated(q);
                out = out + o;
            })

            // console.log('out = '+out);
            out+=articleResultsFooter();
            document.getElementById('searchresults-container').innerHTML = out;
        }else{   
            if(qry.value){
                document.getElementById('searchresults-container').innerHTML = qry.value;
            }else{
                document.getElementById('searchresults-container').innerHTML = 'No Results Found';
            }
        }
    }).catch((err)=>{
        console.log(err);
    })
}

function articleResultsFooter(pagenumber=''){
    let out = '';
    let lastPage = PageQry[PageQry.length-1].page
    let topbox = `
            <div class="box-separator">...</div><div class="page-box" onclick="javascript:loadResultsPage(${lastPage})">${lastPage}</div>
        `
    let bottombox = `
            <div class="page-box" onclick="javascript:loadResultsPage(1)">1</div><div class="box-separator">...</div>
        `
    
    if(PageQry.length==1){
        let pageBox = `
            <div class="page-box">1</div>
        `
        out+=pageBox;
    }
    else if(PageQry.length>5){
        if(pagenumber==''||pagenumber<5){
            if(pagenumber==''){pagenumber =1;}
            PageQry.forEach((page)=>{
                if(page.page <6){
                    let n = page.page;
                    if(pagenumber==n){
                        let pageBox = `
                            <div class="page-box reverse-box" onclick="javascript:loadResultsPage(${n})">${n}</div>
                        `
                        out+=pageBox;
                    }else{
                        let pageBox = `
                            <div class="page-box" onclick="javascript:loadResultsPage(${n})">${n}</div>
                        `
                    out+=pageBox;
                    }
                      
                }
            })
            out+=topbox;
        }
        else if(pagenumber>lastPage-4){
            out+=bottombox;
            PageQry.forEach((page)=>{
                if(page.page > lastPage-5){
                    let n = page.page;
                    if(pagenumber==n){
                        let pageBox = `
                            <div class="page-box reverse-box" onclick="javascript:loadResultsPage(${n})">${n}</div>
                        `
                        out+=pageBox;
                    }else{
                        let pageBox = `
                            <div class="page-box" onclick="javascript:loadResultsPage(${n})">${n}</div>
                        `
                    out+=pageBox;
                    } 
                }
            })
        }
        else{
            out+=bottombox;
            PageQry.forEach((page)=>{
                if(page.page > pagenumber-3 && page.page < pagenumber+3){
                    let n = page.page;
                    if(pagenumber==n){
                        let pageBox = `
                            <div class="page-box reverse-box" onclick="javascript:loadResultsPage(${n})">${n}</div>
                        `
                        out+=pageBox;
                    }else{
                        let pageBox = `
                            <div class="page-box" onclick="javascript:loadResultsPage(${n})">${n}</div>
                        `
                    out+=pageBox;  
                    }
                    
                }
            })
            out+=topbox;
        }
        

    }else{
        PageQry.forEach((page)=>{
            let n = page.page;
            let pageBox = `
                <div class="page-box" onclick="javascript:loadResultsPage(${n})">${n}</div>
            `
            out+=pageBox;
        })
    }
    
    let htmlOut = `
            <div class="article-results-footer">
                <div class="results-footer-box">
                    ${out}
                </div>
            </div>
    `
    return htmlOut;
}

window.viewPdfInTab = (doi,version)=>{
    let url = `https://www.biorxiv.org/content/${doi}v${version}.full.pdf`;
    window.open(url);
}

window.getOtherArticleVersions = async ()=>{
    document.getElementById('related-content').innerHTML = 'Gathering other versions...';
    document.querySelectorAll('.related-top-btn').forEach(q=>{
        if(q.textContent=='Article Versions'){
            q.classList.add('related-selected');
        }else{
            q.classList.remove('related-selected');
        }
    })
    let qry;
    if(otherVersions.length==0){
        qry = await getArticleDoi(Mdoi);
        otherVersions = qry;
    }else{
        qry = otherVersions;
    }
    let ver = qry.value;
    let out = '';
    ver.forEach(v=>{
        out = out + ArticleView.htmlViewRelated(v);
    })

    document.getElementById('related-content').innerHTML = out; 
}

window.savePersonalNotes = async()=>{
    let content = document.getElementById('pnotestxt').value;
    personalNotes = content;
    await fetch('/users/savenote', {
        method:'post',
        body: JSON.stringify({
            doi:Vdoi,
            content:content
        }),
        headers: {
            "Content-Type" : "application/json; charset=utf-8"
        }
    }).then((response)=>{
        return response.json();
    }).then((qry)=>{
        if(qry.result=='ok'){
            document.getElementById('pnotesmsg').textContent='Saved';
            setTimeout(()=>{
                document.getElementById('pnotesmsg').textContent='';
            },1000);
        }
    }).catch((err)=>{
        console.log(err);
    })
}

window.getPersonalNotes = async()=>{
    document.querySelectorAll('.related-top-btn').forEach(q=>{
        if(q.textContent=='Personal Notes'){
            q.classList.add('related-selected');
        }else{
            q.classList.remove('related-selected');
        }
    })
    let out = `
            <div class="personalnotes">
                <div class="pnotes">
                    <textarea id="pnotestxt"></textarea>
                </div>
                <div class="pbuttons">
                    <div class="pbtn-save" onclick="javascript:savePersonalNotes()">Save</div>
                    <div id="pnotesmsg"></div>
                </div>    
            </div>
    `
    document.getElementById('related-content').innerHTML = out;
    if(personalNotes==''){
        await fetch('/users/getnote', {
            method:'post',
            body: JSON.stringify({
                doi:Vdoi
            }),
            headers: {
                "Content-Type" : "application/json; charset=utf-8"
            }
        }).then((response)=>{
            return response.json();
        }).then((qry)=>{
            if(qry.result=='ok'){
                personalNotes = qry.value;
                document.getElementById('pnotestxt').value=qry.value;
            }
        }).catch((err)=>{
            console.log(err);
        })
    }else{
        document.getElementById('pnotestxt').value=personalNotes;
    }
}

window.getRelatedArticles = ()=>{
    document.querySelectorAll('.related-top-btn').forEach(q=>{
        if(q.textContent=='Related Articles'){
            q.classList.add('related-selected');
        }else{
            q.classList.remove('related-selected');
        }
    })
    document.getElementById('related-content').innerHTML = 'Building related articles...';
    
    function myTimer() {
        console.log(VrelatedResults.length);
        if(VrelatedResults.length>0){
            myStopFunction();
        }
    }
    
    function myStopFunction() {
        clearInterval(myVar);
        console.log('Estou aqui');
        if(VrelatedResults.length>0){
            let out = '';
            VrelatedResults.forEach(article=>{
                if(DoiArticle(article.doi_id)!=DoiArticle(Vdoi)){
                    out = out + ArticleView.htmlViewRelated(article);
                }
            });
            document.getElementById('related-content').innerHTML = out;
        }else{
            document.getElementById('related-content').innerHTML = 'No results to show';
        }
    }
    if(VrelatedResults.length>0){
        myStopFunction();
    }else{
        var myVar = setInterval(myTimer, 1000);
    }       
}

window.loadResultsPage = async (page)=>{
    SearchPage.innerHTML = ArticleView.multipleResultsContainer();
    let art = PageQry[page-1].articles;
    console.log(art);
    document.getElementById('searchresults-container').innerHTML = 'Processing your request. Please wait...';
    await fetch('/search/resultspage', {
        method:'post',
        body: JSON.stringify({
            articles:art
        }),
        headers: {
            "Content-Type" : "application/json; charset=utf-8"
        }
    }).then((response)=>{
        return response.json();
    }).then((qry)=>{
        // console.log(qry);
        if(qry.result=='ok'){
            SearchPage.innerHTML = ArticleView.multipleResultsContainer();
            let out = '';
            // console.log(qry);
            qry.value.forEach((q)=>{
                let o = ArticleView.htmlViewRelated(q);
                out = out + o;
            })

            // console.log('out = '+out);
            out+=articleResultsFooter(page);
            document.getElementById('searchresults-container').innerHTML = out;
        }else{
            
            document.getElementById('searchresults-container').innerHTML = 'No Results Found';
        }
    }).catch((err)=>{
        console.log(err);
    })
};

async function searchString(str){
    ContainerTitle.innerHTML = `<div class="title-fav">Search</div><div class="title-fav title-separator"> > </div><div class="title-fav">${str}</div>`;
    SearchPage.innerHTML = ArticleView.multipleResultsContainer();
    document.getElementById('searchresults-container').innerHTML = 'Processing your request. Please wait...';
    await fetch('/search/advsearch', {
        method:'post',
        body: JSON.stringify({
            str:str,
            chbBio:false,
            chbMed:false,
            dateStart:'',
            dateEnd:'',
            category:'',
            author:'',
            title:'',
            abstract:''
        }),
        headers: {
            "Content-Type" : "application/json; charset=utf-8"
        }
    }).then((response)=>{
        return response.json();
    }).then((qry)=>{
        // console.log(qry);
        if(qry.result=='ok'){
            PageQry = qry.list;
            console.log(PageQry);
            SearchPage.innerHTML = ArticleView.multipleResultsContainer();
            let out = '';
            // console.log(qry);
            qry.value.forEach((q)=>{
                let o = ArticleView.htmlViewRelated(q);
                out = out + o;
            })

            // console.log('out = '+out);
            out+=articleResultsFooter();
            document.getElementById('searchresults-container').innerHTML = out;
        }else{
            if(qry.value){
                document.getElementById('searchresults-container').innerHTML = qry.value;
            }else{
                document.getElementById('searchresults-container').innerHTML = 'No Results Found';
            }
            
        }
    }).catch((err)=>{
        console.log(err);
    })
}

async function getRelatedResults(article){
    let out = [];
    await fetch('/search/getrelated', {
        method:'post',
        body: JSON.stringify({
            str:article.title
        }),
        headers: {
            "Content-Type" : "application/json; charset=utf-8"
        }
    }).then((response)=>{
        return response.json();
    }).then((qry)=>{
        console.log(qry);
        if(qry.result=='ok'){
            out = qry.value;
            return;
        }else{   
            // if(qry.value){
            //     document.getElementById('searchresults-container').innerHTML = qry.value;
            // }else{
            //     document.getElementById('searchresults-container').innerHTML = 'No Results Found';
            // }
        }
    }).catch((err)=>{
        console.log(err);
    })
    return out;
}

window.showArticle = async(doi)=>{
    SearchPage.innerHTML = ArticleView.multipleResultsContainer();
    document.getElementById('searchresults-container').innerHTML = 'Processing your request. Please wait...';
    await fetch('/articles/searchdoiid', {
        method:'post',
        body: JSON.stringify({
            doi:doi
        }),
        headers: {
            "Content-Type" : "application/json; charset=utf-8"
        }
    }).then((response)=>{
        return response.json();
    }).then(async (qry)=>{
        if(qry.result=='ok'){
            Vdoi = doi;
            Mdoi = qry.value[0].doi;

            console.log(Mdoi);
            let snip = ArticleView.htmlViewArticle(qry.value[0]);
            let title = ArticleView.htmlInsertTitle(qry.value[0]);
            SearchPage.innerHTML = snip;
            document.getElementById('container-title').innerHTML = title;
            ArticleView.runListeners();
            getOtherArticleVersions();
            VrelatedResults = await getRelatedResults(qry.value[0]);

        }else{
            document.getElementById('searchresults-container').innerHTML = 'No Results Found';
        }
    }).catch((err)=>{
        console.log(err);
    })
    loadArticleDraggables();
    console.log(a);
}


async function getArticleDoi(doi){
    if(!doi.includes('10.1101/')){
        doi = '10.1101/' + doi;
    }
    ContainerTitle.innerHTML = `<div class="title-fav">Search by Article Code</div><div class="title-fav title-separator"> > </div><div class="title-fav">${doi}</div>`;
    let result = await fetch('/articles/searchdoi', {
        method:'post',
        body: JSON.stringify({
            doi:doi
        }),
        headers: {
            "Content-Type" : "application/json; charset=utf-8"
        }
    }).then((response)=>{
        return response.json();
    }).then((qry)=>{
        return qry;
    }).catch((err)=>{
        console.log(err);
    })
    return result;
}

window.showArticleDoi = async ()=>{
    SearchPage.innerHTML = ArticleView.multipleResultsContainer();
    document.getElementById('searchresults-container').innerHTML = 'Processing your request. Please wait...';
    let doi = document.getElementById('fld_doi').value
    let qry = await getArticleDoi(doi)
    SearchPage.innerHTML = ArticleView.multipleResultsContainer();
    if(qry.result=='ok'){
        PageQry = qry.list;
        let out = '';
        qry.value.forEach((q)=>{
            let o = ArticleView.htmlViewRelated(q);
            out = out + o;
        })
        document.getElementById('searchresults-container').innerHTML = out;
    }else{
        document.getElementById('searchresults-container').innerHTML = 'No results found.';
    }
    
}

window.runAdvancedSearch = async ()=>{
    SearchPage.innerHTML = ArticleView.multipleResultsContainer();
    document.getElementById('searchresults-container').innerHTML = 'Processing your request. This might take a while. Please wait...';
    let search = document.getElementById('fld_search').value;
    ContainerTitle.innerHTML = `<div class="title-fav">Search</div><div class="title-fav title-separator"> > </div><div class="title-fav">${search}</div>`;
    let chbBio = document.getElementById('fld_bio').checked;
    let chbMed = document.getElementById('fld_med').checked;
    let dateStart = document.getElementById('fld_date_start').value;
    let dateEnd = document.getElementById('fld_date_end').value;
    let category = document.getElementById('fld_category').value;
    let author = document.getElementById('fld_author').value;
    let title = document.getElementById('fld_title').value;
    let abstract = document.getElementById('fld_abstract').value;

    await fetch('/search/advsearch', {
        method:'post',
        body: JSON.stringify({
            str:search,
            chbBio:chbBio,
            chbMed:chbMed,
            dateStart:dateStart,
            dateEnd:dateEnd,
            category:category,
            author:author,
            title:title,
            abstract:abstract
        }),
        headers: {
            "Content-Type" : "application/json; charset=utf-8"
        }
    }).then((response)=>{
        return response.json();
    }).then((qry)=>{
        // console.log(qry);
        if(qry.result=='ok'){
            PageQry = qry.list;
            console.log(PageQry);
            SearchPage.innerHTML = ArticleView.multipleResultsContainer();
            let out = '';
            // console.log(qry);
            qry.value.forEach((q)=>{
                let o = ArticleView.htmlViewRelated(q);
                out = out + o;
            })

            // console.log('out = '+out);
            out+=articleResultsFooter();
            document.getElementById('searchresults-container').innerHTML = out;
        }else{   
            if(qry.value){
                document.getElementById('searchresults-container').innerHTML = qry.value;
            }else{
                document.getElementById('searchresults-container').innerHTML = 'No Results Found';
            }
        }
    }).catch((err)=>{
        console.log(err);
    })

}

function urlBaseFolder(){
    let url = document.URL.split('/');
    url = url[3];
    if(url.includes('?')){
       url = url.substring(0,url.indexOf('?'));
       return url; 
    }else{
        return url;
    }
}
//==========================================================================================================================
// function loadArticleDraggables(){
//     let dragg = document.querySelectorAll('.article-draggable');
//     let dropp = document.querySelectorAll('.article-dropbox');
//     dragg.forEach(d=>{
//         d.addEventListener('dragstart',()=>{
//             console.log('Start');
//         })
//     })
//     dragg.forEach(d=>{
//         d.addEventListener('dragend',()=>{
//             console.log('End');
//         })
//     })
//     dropp.forEach(d=>{
//         d.addEventListener('dragenter',()=>{
//             console.log('Entered');
//             SidebarBtnSearch.classList.remove('btn-selected');
//             SidebarBtnFolders.classList.add('btn-selected');
//             SidebarContent.innerHTML = SidebarView.loadTreeSidebar();
//             Tree.load();
//         })
//     })
//     dropp.forEach(d=>{
//         d.addEventListener('dragleave',()=>{
//             console.log('Left');
//             SidebarBtnSearch.classList.add('btn-selected');
//             SidebarBtnFolders.classList.remove('btn-selected');
//             // ContainerTitle.innerHTML = '<div class="title-fav">Search</div>';
//             document.getElementById('container-results').innerHTML = '';
//             SidebarContent.innerHTML = SidebarView.loadSearchSidebar();
//             document.querySelectorAll('.enter-exec').forEach((q)=>{
//                 q.addEventListener('keypress',(e)=>{
//                     if (e.key === 'Enter') {
//                         runAdvancedSearch();
//                     }
//                 });
//             })
//         })
//     })
//     dropp.forEach(d=>{
//         d.addEventListener('dragover',()=>{
//             console.log('over the box');
//         })
//     }) 
// }

async function main(){
    session = await EventListeners.validSession();
    if(!session.result){
        document.getElementById('btn-folders').style.visibility = 'hidden';
    }else{
        Tree.loadFavorites();
    }
    const urlParams = new URLSearchParams(window.location.search);
    let url = urlBaseFolder()
    if(url=='search'){
        btnSearchLoad();
        SidebarModule.onLoad();
    }else if(url=='favorites'){
        btnTreeLoad();
    }else{}
    categories.buildCategoriesArray();
    runResize();
    
    if(urlParams.has('category')){
        let x = urlParams.getAll('category')
        searchCategory(x[0]);
    }else if(urlParams.has('search')){
        let x = urlParams.getAll('search')
        document.getElementById('fld_search').value = x[0];
        searchString(x[0]);
    }else if(urlParams.has('doi')){
        let x = urlParams.getAll('doi')
        showArticle(x[0]);
    }else{}

}

main();

// export {runAdvancedSearch}