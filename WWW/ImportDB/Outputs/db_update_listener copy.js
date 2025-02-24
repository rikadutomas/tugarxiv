// ============   tugaRxiv  ============================
//Sistema de update continuo dos dados de biorxiv e medrxiv na base de dados 

require('dotenv').config()
const fetch = require('node-fetch');
const fs = require('fs')
// var counter = 0;
const StopWords = readArrayFromFile();
const arrServers = ['biorxiv','medrxiv'];
const mongoose = require('mongoose');
const MDB_ACCESS = process.env.MDB_ACCESS;
var content = '';
var arrLogArticle = [];
var SearchIndex = {};
var SI1 = {};
var SI2 = {};
var SI3 = {};
var SI4 = {};
var SI5 = {};
var yesterday = new Date((new Date()).valueOf() - 1000*60*60*24);

mongoose.connect(MDB_ACCESS,{ useNewUrlParser: true, useUnifiedTopology: true})
    .catch((err)=>{
        content = '\n' + timeNow() + ' >> Mongo DB connection error: ' + err;
        console.log(content);
        logEvent(content);
    });

const articleSchema = new mongoose.Schema({
    doi: String,
    doi_id: String,
    title: String,
    authors: String,
    author_corresponding: String,
    author_corresponding_institution: String,
    date: String,
    version: String,
    type: String,
    license: String,
    category: String,
    jatsxml:{
        type:String,
        required:false,
        default:""
    },
    abstract: String,
    published: String,
    server: String
});

const SearchIndexSchema = new mongoose.Schema({
    word: String,
    articles: {
        type: Array,
        default:[]
    },
    total_articles: {
        type: Number,
        default: 0
    }
});

const ArticleIndexSchema = new mongoose.Schema({
    doi_id: String,
    total_words: {
        type: Number,
        default:0
    }
});

const Article = mongoose.model('tblarticles',articleSchema);
const WordIndex = mongoose.model('tblWordIndex',SearchIndexSchema);
const ArticleIndex = mongoose.model('tblArticleIndex',ArticleIndexSchema);

function logEvent(content){
    fs.writeFile('db_update_listener.txt', content, { flag: 'a' }, err => {});
}

function readArrayFromFile() {
    let fileContent = fs.readFileSync('StopWordsArray.txt');
    let array = JSON.parse(fileContent);
    return array;
}

function loadSearchIndex(){
    return new Promise((resolve,reject)=>{
        let s1 = new Promise ((resolve, reject)=>{
            fs.readFile('SI1.json', (err, data) => {
                if (!err){
                    SI1 = JSON.parse(data);
                    console.log('Data read from file 1');
                    resolve(true);
                }       
            });
        }); 
        let s2 = new Promise ((resolve, reject)=>{
            fs.readFile('SI2.json', (err, data) => {
                if (!err){
                    SI2 = JSON.parse(data);
                    console.log('Data read from file 2');
                    resolve(true);
                }       
            });
        }); 
        let s3 = new Promise ((resolve, reject)=>{
            fs.readFile('SI3.json', (err, data) => {
                if (!err){
                    SI3 = JSON.parse(data);
                    console.log('Data read from file 3');
                    resolve(true);
                }       
            });
        }); 
        let s4 = new Promise ((resolve, reject)=>{
            fs.readFile('SI4.json', (err, data) => {
                if (!err){
                    SI4 = JSON.parse(data);
                    console.log('Data read from file 4');
                    resolve(true);
                }       
            });
        }); 
        let s5 = new Promise ((resolve, reject)=>{
            fs.readFile('SI5.json', (err, data) => {
                if (!err){
                    SI5 = JSON.parse(data);
                    console.log('Data read from file 5');
                    resolve(true);
                }       
            });
        }); 

        Promise.all([s1, s2, s3,s4,s5]).then(() => {
            resolve(true);
        });
    });
}

function saveSearchIndex(){
    return new Promise((resolve)=>{
        let ss1 = new Promise((resolve)=>{
            let data = JSON.stringify(SI1, null, 2);
            fs.writeFile('SI1.json', data, (err) => {
                if (err) throw err;
                console.log('Data written to SI1.json');
                resolve(true);
            });
        });
        let ss2 = new Promise((resolve)=>{
            let data = JSON.stringify(SI2, null, 2);
            fs.writeFile('SI2.json', data, (err) => {
                if (err) throw err;
                console.log('Data written to SI2.json');
                resolve(true);
            });
        });
        let ss3 = new Promise((resolve)=>{
            let data = JSON.stringify(SI3, null, 2);
            fs.writeFile('SI3.json', data, (err) => {
                if (err) throw err;
                console.log('Data written to SI3.json');
                resolve(true);
            });
        });
        let ss4 = new Promise((resolve)=>{
            let data = JSON.stringify(SI4, null, 2);
            fs.writeFile('SI4.json', data, (err) => {
                if (err) throw err;
                console.log('Data written to SI4.json');
                resolve(true);
            });
        });
        let ss5 = new Promise((resolve)=>{
            let data = JSON.stringify(SI5, null, 2);
            fs.writeFile('SI5.json', data, (err) => {
                if (err) throw err;
                console.log('Data written to SI5.json');
                resolve(true);
            });
        });

        Promise.all([ss1, ss2, ss3,ss4,ss5]).then(() => {
            resolve(true);
        });
    });
}

function cleanArticle(doi,version){
    let doiclean = doi.replace('10.1101/','');
    if(doiclean.indexOf('.') !== -1){
        doiclean = doiclean.substring(11);
    }
    return doiclean+'.'+version;
}

function num2(number) {  //converte os numeros single digit em double digit
    return (number < 10 ? '0' : '') + number
}

function timeNow(){
    let today = new Date();
    let date = today.getFullYear()+'-'+(num2(today.getMonth()+1))+'-'+num2(today.getDate());
    let time = today.getHours() + ":" + num2(today.getMinutes()) + ":" + num2(today.getSeconds());
    return date+' '+time;
}

function dateNow(today){
    if(today==undefined){
        today = new Date();
    }
    let date = today.getFullYear()+'-'+(num2(today.getMonth()+1))+'-'+num2(today.getDate());
    return date;
}

function isNumeric(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
}

function cleanText(str){
    str = str.toLowerCase();
    let q = str.replace( /\r\n/g, '').replace(/^\s+|\s+$/, '').replace(/-/g, ' ').replace(/[^a-z0-9\s]+/gi, '').replace(/\s+$/, '');
    let parts = q.split(/\s/);
    for(let index=0;index<parts.length;index++){ 
        let num=parts[index];
        if (num.length==1) {
            parts.splice(index,1);
        }
        else if (isNumeric(num.valueOf())) {
            parts.splice(index,1);
        }
    };
    terms=[];
    parts.forEach(part => {
        if(StopWords.indexOf(part) === -1 && part!='') {
            terms.push(part);
        }
    });
    return terms;
}

function findArticle(doi){
    for(wrd in SearchIndex){
        if(SearchIndex[wrd][doi]){
            return true;
        }
    }
    return false
}

function indexWord(word,doi){
    let letterValue = word.charAt(0).charCodeAt();
    if(letterValue>=97&&letterValue<103){
        SearchIndex = SI1;
    }else if(letterValue>102&&letterValue<110){
        SearchIndex = SI2;
    }else if(letterValue>109&&letterValue<116){
        SearchIndex = SI3;
    }else if(letterValue>115&&letterValue<123){
        SearchIndex = SI4;
    }else{
        SearchIndex = SI5;
    }

    if(SearchIndex[word]){
        if(SearchIndex[word][doi]){
            SearchIndex[word][doi].value += 1;
        }else{
            SearchIndex[word][doi] = {value:1};
        }
    }else{
        SearchIndex[word] = {}
        let x = SearchIndex[word];
        x[doi] = {value:1};
    }
    if(letterValue>=97&&letterValue<103){
        SI1 = SearchIndex;
    }else if(letterValue>102&&letterValue<110){
        SI2 = SearchIndex;
    }else if(letterValue>109&&letterValue<116){
        SI3 = SearchIndex;
    }else if(letterValue>115&&letterValue<123){
        SI4 = SearchIndex;
    }else{
        SI5 = SearchIndex;
    }
}

function graphWords(doi,data){
    data.forEach((word)=>{
        if(!isNumeric(word)){
            indexWord(word,doi);    
        }
        
    })
}

function processArticle(article){
    return new Promise((resolve,reject)=>{
        let doi = article.doi_id;
        if(!findArticle(doi)){
            let title = cleanText(article.title);
            let abstract = cleanText(article.abstract);
            graphWords(doi,title);
            graphWords(doi,abstract);
        }
        console.log('Index Update: ' + doi);
        resolve(true);
    })
    
}

async function get_request(dateArticles,nArticles,sourceDb){
    let url = "https://api.biorxiv.org/details/" + sourceDb + "/"+dateArticles+"/"+dateArticles+"/"+nArticles
    console.log(url);
    let res = '';
    do {
        err = false;
        res = await fetch(url).catch((error)=>{
            err = true;
            setTimeout(function (){
                content = '\n' + timeNow() + ' >> Error requesting articles to Mongo DB : ' + error;
                console.log(content);
                logEvent(content);
            },5000);
        });
    } while(err);
    let data = await res.json();
    return Promise.resolve(data);
}

async function articleExistsInDb(article){
        let art = await Article.findOne({'doi':article.doi,'version':article.version}).catch((res)=>{return res;});
        if(art!=null){return true}
        else{return false}
}

async function addArticleToDb(article){
    
    article.doi_id = cleanArticle(article.doi,article.version);
    let myData = new Article(article);
    await myData.save().then(()=>{return 'ok'})
        .catch(err =>{
            content = '\n' + timeNow() + ' >> Error saving ' + article.doi +' to Mongo DB : ' + err;
                console.log(content);
                logEvent(content);
        });
}

async function saveDb(json,dateArticles){
    let collection = json.collection;
    for(x=0;x<collection.length;x++){
        let article = collection[x];
        //console.log(article.doi + ' v' + article.version + ' >> ' + await articleExistsInDb(article));
        if(!await articleExistsInDb(article)){
            await addArticleToDb(article).then((prom)=>{console.log(prom)});
            await processArticle(article).then((prom)=>{console.log(prom)}); //add to index
            arrLogArticle.push(article.doi + 'v' + article.version + ': ' + article.title);
        }
    }
    return Promise.resolve('SaveDB done');
}

async function fetchArticles(dateArticles,sourceDb){
    let numArticles = 0
    let json = await get_request(dateArticles,numArticles,sourceDb);
    let totalArticles = json.messages[0].total;
    await saveDb(json,dateArticles).then((prom)=>{console.log(prom)});
    if(totalArticles>99){
        totalArticles -= 100;
        numArticles = 100
        while(totalArticles > 0){
            json = await get_request(dateArticles,numArticles);
            await saveDb(json,dateArticles).then((prom)=>{console.log(prom)});
            numArticles += 100;
            totalArticles-=100;
        }
    }
    return Promise.resolve('Fetch Done');
}

async function runUpdate(dateArticles){  
    if(dateArticles==undefined){
        dateArticles = dateNow();
    }else{
        dateArticles = dateNow(dateArticles);
    }
    let totalArticlesUpdated = 0;
    for(let xx=0;xx<arrServers.length;xx++){
        server = arrServers[xx];
        counter = 0;
        arrLogArticle = [];
        content = '\n' +'Processing '+dateArticles+' : '+ timeNow() + ' >> Update from Server -> ' + server;
        console.log(content);
        await fetchArticles(dateArticles,server).then((prom)=>{console.log('Fetch1 ' + prom)});
        if(arrLogArticle.length>0){
            logEvent('\n=====================================================================================' + content);
            arrLogArticle.forEach((art)=>{
                console.log(art);
                logEvent('\n' + art);
            });
        }
        totalArticlesUpdated += arrLogArticle.length;
        content = '\n' + 'Total Updates > '+ arrLogArticle.length;
        console.log(content);
        if(arrLogArticle.length>0){
            logEvent(content);
        }
    }
    // if(totalArticlesUpdated>=0){
    //     await saveSearchIndex().then(()=>{console.log('All DBs Saved')});
    // }
    console.log('UPDATE IS COMPLETE');
    return Promise.resolve(totalArticlesUpdated);
}

async function DBUpdateListener(){
    let imp = await loadSearchIndex();
    if(imp){
        console.log('Import files to index: Done')
    } else{
        console.log('Error: Failure on import files to Index variables')
    };
    let totalUpdated = await runUpdate(yesterday);
    totalUpdated += await runUpdate();
    if(totalUpdated>0){
        await saveSearchIndex()
        .then(()=>{
            SearchIndex = {};
            SI1 = {};
            SI2 = {};
            SI3 = {};
            SI4 = {};
            SI5 = {};
        })
        .then(()=>{console.log('All DBs Saved and Memory free > Total Update: ' + totalUpdated)});
    }else{
        SearchIndex = {};
        SI1 = {};
        SI2 = {};
        SI3 = {};
        SI4 = {};   
        SI5 = {};
        console.log('No Changes on the SI files. Memory free > Total Update: ' + totalUpdated)
    }
    console.log('========== task complete =============');
}

(()=>{
    DBUpdateListener()
    setInterval(async ()=>{
        DBUpdateListener()
    }, 1000*60*60); //60min
})();
