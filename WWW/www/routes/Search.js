const express = require('express');
const router = express.Router();
const Articles = require('../models/ArticleModel');
const WordIndex = require('../models/SearchIndexModel');
const ArticleIndex = require('../models/ArticleIndexModel');
const path = require('path');
// const LPM = require('../controllers/lpm');
// const servers = ['biorxiv','medrxiv'];
// const SearchIndex = require('../server');

//send Search Page
router.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,'../_public/html/search.html'))
})

router.get('/getcategories',async (req,res)=>{
    let out = await getCategories();
    return res.json(out); 
})

router.post('/searchcategory',async (req,res)=>{
    let arrDoi = [];
    let arrArticles = [];
    let counter = 0;
    let category = req.body.category;
    let out = await Articles.find({category:category}).sort({$natural:-1}).limit(1000).catch((err)=>{console.log(err);});
    out.forEach(o=>{
        counter++;
        arrDoi.push(o.doi_id);
        if(counter<=50){
            arrArticles.push(o);
        }
    })
    arrDoi = await packResults(arrDoi);
    if(arrDoi.length==0){
        return res.json({
            result:'err',
            value:'No results found',
        }) 
    }
    return res.json({
        result:'ok',
        value:arrArticles,
        list:arrDoi
    })
})

router.post('/resultspage',async (req,res)=>{
    let arrGetArticles = req.body.articles;

    let arrOut = await Articles.find({doi_id:{$in:arrGetArticles}})

    arrOut = await sortArticleResults(arrOut,arrGetArticles);

    return res.json({
        result:'ok',
        value:arrOut,
        list:arrGetArticles
    })
})

router.post('/advsearch',async(req,res)=>{
    let SearchBody = req.body;
    let arrStr = req.body.str;
    let arrWords = [];
    let arrArticles = [];

    if(arrStr.length==0){
        return res.json({
            result:'err',
            value:'Search field cannot be empty.'
        })
    }
    arrStr = arrStr.toLowerCase().split(' ');
    arrStr = await cleanStopWords(arrStr);

    if(arrStr.length==0){
        return res.json({
            result:'err'
        })
    }
    let totalArticlesInDb = await getTotalArticlesInDb(); //get amount of documents in DB
    let wordsArray = await getWordArticles(arrStr); //returns words content
    await createWordsAndArticlesArrays(arrWords,arrArticles,wordsArray,totalArticlesInDb);
    let articleGroupsArray = await buildArticleGroups(arrWords,arrArticles);
    let finalArray = await filterResultsGroups(articleGroupsArray,SearchBody);
    let doiList = await packResults(finalArray[1])
    return res.json({
        result:'ok',
        value:finalArray[0],
        list:doiList
    })
})


router.post('/getrelated',async(req,res)=>{
    let SearchBody = '';
    let arrStr = req.body.str;
    let arrWords = [];
    let arrArticles = [];

    arrStr = arrStr.toLowerCase().split(' ');
    arrStr = await cleanStopWords(arrStr);
    if(arrStr.length==0){
        return res.json({
            result:'err'
        })
    }
    let totalArticlesInDb = await getTotalArticlesInDb(); //get amount of documents in DB  
    let wordsArray = await getWordArticles(arrStr); //returns words content
    await createRelatedWordsAndArticlesArrays(arrWords,arrArticles,wordsArray,totalArticlesInDb);
    let articleGroupsArray = await buildArticleGroups(arrWords,arrArticles);
    let finalArray = await filterRelatedResultsGroups(articleGroupsArray);
    let doiList = await packResults(finalArray[1])
    return res.json({
        result:'ok',
        value:finalArray[0],
        list:doiList
    })
})

// -----------------FUNCTIONS-----------------------------------------------------------

function now(){
    var today = new Date();
    let minut = today.getMinutes();
    if(minut<10){
        minut = '0' + minut
    }
    var time = today.getHours() + ":" + minut + ":" + today.getSeconds();
    return time;
}

function getCategories(){
    return new Promise((resolve,reject)=>{
        let qry = [];
        let s1 = new Promise ((resolve, reject)=>{
            Articles.distinct('category',{server:'biorxiv'}).then((out)=>{
                qry.push({category:'biorxiv',values:out});
            }).then(()=>{
                resolve(true)
            }) 
        }); 
        let s2 = new Promise ((resolve, reject)=>{
            Articles.distinct('category',{server:'medrxiv'}).then((out)=>{
                qry.push({category:'medrxiv',values:out});
            }).then(()=>{resolve(true)})
        }); 

        Promise.all([s1,s2]).then(() => {
            resolve(qry);
        });
    });
}

// router.get('/search')
//stage 1
function cleanStopWords(arr){
    return new Promise((resolve)=>{
        let arrOut = [];
        for(let x=0;x<arr.length;x++){
            if(!StopWords.includes(arr[x])){
                arrOut.push(arr[x]);
            }
        }
        resolve(arrOut);
    })
}

//stage 2
function getTotalArticlesInDb(){
    return new Promise((resolve)=>{
        Articles.countDocuments().then(res=>{
            resolve(res);
        });
    });
}
//stage 3
function getWordArticles(arr){
    return new Promise(async (resolve)=>{
        let arrOut = await WordIndex.find({word:{$in:arr}});
        let soma = 0;
        arrOut.forEach(out=>{
            soma = soma + out.articles.length
        })
        resolve(arrOut);
    })
}


// Stage 4

function createWordsAndArticlesArrays(arrWords,arrArticles,wordsArray,totalArticlesInDb){
    return new Promise((resolve)=>{
        wordsArray.forEach(wrd=>{
            let wordObj = {
                word:wrd.word,
                idf:Math.log10(totalArticlesInDb/wrd.total_articles)
            }
            arrWords.push(wordObj);
            wrd.articles.forEach(art=>{
                let artdoi = DoiArticle(art.doi_id);
                let artver = DoiVersion(art.doi_id);
                let exists = false;
                for(let x=0;x<arrArticles.length;x++){
                    if(arrArticles[x]!=undefined && artdoi==DoiArticle(arrArticles[x])){
                        exists = true;
                        if(DoiVersion(arrArticles[x])<artver){
                            arrArticles[x] = art.doi_id;
                        }
                        break;
                    }
                }
                if(!exists){
                    arrArticles.push(art.doi_id);
                }
            })
        })
        resolve(true);
    })
}

function createRelatedWordsAndArticlesArrays(arrWords,arrArticles,wordsArray,totalArticlesInDb){
    return new Promise((resolve)=>{
        wordsArray.forEach(wrd=>{
            let wordObj = {
                word:wrd.word,
                idf:Math.log10(totalArticlesInDb/wrd.total_articles)
            }
            arrWords.push(wordObj);
        });
        arrWords.sort((a, b)=>{return b.idf - a.idf});

        for(let x=0;x<3;x++){
            let w = arrWords[x].word;
            let index = wordsArray.findIndex(f=>{
                if(f.word==w){
                    return true;
                }
            })
            let wrd = wordsArray[index];
            wrd.articles.forEach(art=>{
                let artdoi = DoiArticle(art.doi_id);
                let artver = DoiVersion(art.doi_id);
                let exists = false;
                for(let x=0;x<arrArticles.length;x++){
                    if(arrArticles[x]!=undefined && artdoi==DoiArticle(arrArticles[x])){
                        exists = true;
                        if(DoiVersion(arrArticles[x])<artver){
                            arrArticles[x] = art.doi_id;
                        }
                        break;
                    }
                }
                if(!exists){
                    arrArticles.push(art.doi_id);
                }
            })
        }
        resolve(true);
    })
}

//Stage 5

function splitToChunks(array, parts) {
    let result = [];
    for (let i = parts; i > 0; i--) {
        result.push(array.splice(0, Math.ceil(array.length / i)));
    }
    return result;
}

function treatBlock(articles,arrWords,arrOut){
    return new Promise((resolve)=>{
        for(let x=0;x<articles.length;x++){
            let wcount = 0;
            let article = articles[x];
            let total_word_count = article.total_word_count;
            let tfidf = 0.0;
            arrWords.forEach(w=>{
                let res = article.words.findIndex((post)=>{
                    if(post.word==w.word){
                        return true
                    }
                })
                if(res>-1){
                    tfidf += (article.words[res].count / total_word_count) * w.idf;
                    wcount++;
                }
            })
            let obj = {
                doi_id:article.doi_id,
                tfidf:tfidf
            }
            if(arrOut[wcount]==undefined){
                arrOut[wcount]=[];
                arrOut[wcount].push(obj);
            }else{
                arrOut[wcount].push(obj);
            }
        }
        resolve(true)
    })
}

function buildArticleGroups(arrWords,arrArticles){
    return new Promise(async (resolve)=>{
        let arrOut = [];
        let articles = await ArticleIndex.find({doi_id:{$in:arrArticles}});
        let arrChuncks = splitToChunks(articles, 4);

        let s1 = treatBlock(arrChuncks[0],arrWords,arrOut);
        let s2 = treatBlock(arrChuncks[1],arrWords,arrOut);
        let s3 = treatBlock(arrChuncks[2],arrWords,arrOut);
        let s4 = treatBlock(arrChuncks[3],arrWords,arrOut);

        Promise.all([s1, s2,s3,s4]).then(() => {
            arrOut.forEach(out=>{
                out.sort((a, b)=>{
                    return b.tfidf - a.tfidf;
                });
            })
            resolve(arrOut);
        });
    })
}


// Stage 6


function filterOn(SearchBody){
    if(SearchBody.chbBio==true ||SearchBody.chbMed==true){
        if(!(SearchBody.chbBio==true && SearchBody.chbMed==true)){
            return true;
        }
    } 
    if(SearchBody.dateStart!=''||SearchBody.dateEnd!=''){
        return true;
    }
    else if(SearchBody.category!=''||SearchBody.author!=''||SearchBody.title!=''||SearchBody.abstract!=''){
        return true;
    }
    else {
        return false;
    } 
}

function filterResults(article,SearchBody){
    let isValid = true;
    if(!(SearchBody.chbBio==true && SearchBody.chbMed==true) && !(SearchBody.chbBio==false && SearchBody.chbMed==false)){
        if(SearchBody.chbBio==true && article.server!='biorxiv'){
            isValid = false;
        }
        if(SearchBody.chbMed==true && article.server!='medrxiv'){
            isValid = false;
        }
    }
    if(SearchBody.category!='' && SearchBody.category!=article.category){
        isValid = false;
    }
    if(SearchBody.dateStart!=''||SearchBody.dateEnd!=''){
        let dtart;
        let dend;
        if(SearchBody.dateStart==''){
            dstart = new Date('2013-11-07');
        }else{
            dstart = new Date(SearchBody.dateStart);
        }
        if(SearchBody.dateEnd==''){
            dend = new Date();
        }else{
            dend = new Date(SearchBody.dateEnd);
        }
        let artDate = new Date(article.date);
        if(artDate<dstart || artDate > dend){
            isValid = false;
        }
    }
    if(SearchBody.author!=''){
        let exists = false;
        let sAuthor = SearchBody.author.split(' ');
        sAuthor.forEach(s=>{
            if(article.authors.includes(s)){
                exists = true;
            }
        });
        if(!exists){
            isValid = false;
        }
    }
    if(SearchBody.title!=''){
        let exists = false;
        let sTitle = SearchBody.title.split(' ');
        sTitle.forEach(s=>{
            if(article.title.includes(s)){
                exists = true;
            }
        });
        if(!exists){
            isValid = false;
        }
    }
    if(SearchBody.abstract!=''){
        let exists = false;
        let sAbstract = SearchBody.abstract.split(' ');
        sAbstract.forEach(s=>{
            if(article.abstract.includes(s)){
                exists = true;
            }
        });
        if(!exists){
            isValid = false;
        }
    }
    
    return isValid;
}

function packResults(arrGetArticles){
    return new Promise((resolve)=>{
        let counter = 0;
        let arrOut = [];
        let blockChain = {};
        if(arrGetArticles.length==0){
            resolve(arrOut);   
        }
        for(let x = 0; x < arrGetArticles.length; x++){
            if(x%50==0){
                if(counter!=0){
                    arrOut.push(blockChain);
                }
                counter++;
                blockChain = {
                    page:counter,
                    articles:[]
                }
            }
            blockChain.articles.push(arrGetArticles[x]);
            
        }
        if(blockChain.articles.length!=0){
            arrOut.push(blockChain); 
        }
        
        resolve(arrOut);
    });
}

function filterResultsGroups(articleGroupsArray,SearchBody){
    return new Promise(async (resolve)=>{
        let artCounter = 0;
        let filter;
        if(SearchBody==''){
            filter = false;
        }else{
            filter = filterOn(SearchBody);
        }
        let arrSortArticles = [];
        let arrSortDoi = [];
        for(let x=articleGroupsArray.length-1;x>0;x--){
            let arrResults = [];
            articleGroupsArray[x].forEach(art=>{ //filtra so artigos
                arrResults.push(art.doi_id);
            });
            let articlesArray = await Articles.find({doi_id:{$in:arrResults}});
            arrResults.forEach((res)=>{
                index = articlesArray.findIndex(x=>x.doi_id===res);
                let article = articlesArray[index];
                if(filter){
                    let filterResult = filterResults(article,SearchBody);
                    artCounter++;
                    if(filterResult){
                        if(artCounter<50){
                            arrSortArticles.push(article);
                        }
                        arrSortDoi.push(article.doi_id);
                    }                 
                }
                else{
                    artCounter++;
                    if(artCounter<50){
                        arrSortArticles.push(article);
                    }
                    if(article){
                        arrSortDoi.push(article.doi_id);
                    }
                }
            });
        }
        resolve([arrSortArticles,arrSortDoi]);         
    })
}

function filterRelatedResultsGroups(articleGroupsArray){
    return new Promise(async (resolve)=>{
        let artCounter = 0;   
        let arrSortArticles = [];
        let arrSortDoi = [];
        for(let x=articleGroupsArray.length-1;x>0;x--){
            if(articleGroupsArray[x]!=undefined){
                let arrResults = [];
                articleGroupsArray[x].forEach(art=>{ //filtra so artigos
                    arrResults.push(art.doi_id);
                });
                let articlesArray = await Articles.find({doi_id:{$in:arrResults}});
                arrResults.forEach((res)=>{
                    index = articlesArray.findIndex(x=>x.doi_id===res);
                    let article = articlesArray[index];
                    artCounter++;
                    if(artCounter<12){
                        arrSortArticles.push(article);
                        arrSortDoi.push(article.doi_id);
                    }
                    else{
                        resolve([arrSortArticles,arrSortDoi]);
                    }
                });
            }
        }
        resolve([arrSortArticles,arrSortDoi]);         
    })
}


// ============================New Stage===================================================================================

function sortArticleResults(arr,arrGetArticles){
    return new Promise((resolve)=>{
        let arrOut = [];
        arrGetArticles.forEach(art=>{
            for(let x=0;x<arr.length;x++){
                if(arr[x].doi_id==art){
                    arrOut.push(arr[x]);
                    break;
                }
            }
        })
        resolve(arrOut);
    })
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

function DoiVersion(doi_id){
    let arr=doi_id.split('.');
    if(arr.length > 2){
        return arr[arr.length-1];
    }else{
        return arr[1]
    }
}


module.exports = router;