// ============   tugaRxiv  ============================
//Sistema de update continuo dos dados de biorxiv e medrxiv na base de dados 

require('dotenv').config()
const fetch = require('node-fetch');
const fs = require('fs')
// var counter = 0;
const StopWords = readArrayFromFile();
const arrServers = ['biorxiv','medrxiv'];
const mongoose = require('mongoose');
const { resolve } = require('path');
const { load } = require('dotenv');
const MDB_ACCESS = process.env.MDB_ACCESS;
var content = '';
var arrLogArticle = [];
var SearchIndex = {};
var SI1 = {};
var SI2 = {};
var SI3 = {};
var SI4 = {};
var SI5 = {};
var arrIdxWords = [];
var arrIdxArticles = [];
var retryIndexWord = [];
var retryArticleWord = [];
var doiArray = [];
var yesterday = new Date((new Date()).valueOf() - 1000*60*60*24);

// var startDate = new Date("11/07/2013"); // mm/dd/yyyy
// var endDate = new Date("12/07/2013");   // mm/dd/yyyy
var startDate = new Date("12/21/2018"); // mm/dd/yyyy
var endDate = new Date("07/07/2021");   // mm/dd/yyyy

mongoose.connect(MDB_ACCESS,{ useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify:false,useCreateIndex:true})
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
    word: {
        type:String,
        unique:true,
        required:true,
        dropDups:true,
        index:true
    },
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
    doi_id: {
        type:String,
        unique:true,
        required:true,
        dropDups:true,
        index:true
    },
    words: {
        type:Array,
        default:[]

    },
    total_words: {
        type: Number,
        default:0
    },
    total_word_count: {
        type: Number,
        default:0
    }

});

const Article = mongoose.model('tblarticles',articleSchema);
const WordIndex = mongoose.model('idxWords',SearchIndexSchema);
const ArticleIndex = mongoose.model('idxArticles',ArticleIndexSchema);

function getDateTime() {
    var date = new Date();
    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;
    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;
    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;
    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;
    return year + ":" + month + ":" + day + " >> " + hour + ":" + min + ":" + sec;
}

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}

function arrDate(start,end){
    dat = [];
    var loop = new Date(start);
    while(loop <= end){
        var out = formatDate(loop);
        dat.push(out);
        var newDate = loop.setDate(loop.getDate() + 1);
        loop = new Date(newDate);
    }
    return dat;
}

function catchDates(start,end){
    dat = arrDate(start,end);
    return dat;
}

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
    // if(doiclean.indexOf('.') !== -1){
    //     doiclean = doiclean.substring(11);
    // }
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

async function indexWord(word,doi){
    return new Promise(async (resolve)=>{
        if(!arrIdxWords.includes(word)){
            arrIdxWords.push(word);
            let art = {
                doi_id:doi,
                count:1
            }
            let newWord = new WordIndex({
                word:word,
                articles:[art],
                total_articles:1
            });
            newWord.save().then((qry)=>{
                // console.log(qry);
                setTimeout(()=>{
                    resolve(true);},200);
            }).catch((err)=>{
                console.log(err);
            });
        }else{
            await WordIndex.findOne({"word":word}).then(async (res)=>{
                if(res){
                    let art = res.articles;
                    let found=false;
                    for(let x=0;x<art.length;x++){
                        if(art[x].doi_id==doi){
                            art[x].count += 1;
                            found = true;
                        }
                    }
                    if(!found){
                        art.push({
                            doi_id:doi,
                            count:1
                        })
                        res.total_articles+=1;
                    }
                    await WordIndex.findOneAndUpdate({word:word},{
                        articles:res.articles,
                        total_articles:res.total_articles
                    },{new:true}).then((qry)=>{
                        // console.log(qry);
                        setTimeout(()=>{resolve(true);},100);
                    });
                }else{
                    console.log('>>>>>>>>>>>>>>>>>   WARNING : ' + word +' not found. Doi : ' + doi);
                    let obj = {
                        doi:doi,
                        word:word
                    }
                    retryIndexWord.push(obj);
                    resolve(true);
                }
            });
        }
    });
}
async function indexArticleWord(word,doi){
    return new Promise(async (resolve)=>{   
        if(!arrIdxArticles.includes(doi)){
            arrIdxArticles.push(doi);
            let wrd = {
                word:word,
                count:1,
                tf:0.0
            }
            let newArticle = new ArticleIndex({
                doi_id:doi,
                words:[wrd],
                total_words:1,
                total_word_count:1
            });
            newArticle.save().then((qry)=>{
                setTimeout(()=>{
                    resolve(true);},200);
            }).catch((err)=>{
                console.log(err);
            });
        }
        else{
            await ArticleIndex.findOne({doi_id:doi}).lean().then(async(res)=>{
                if(res){
                    let wrd = res.words;
                    let found=false;
                    for(let x=0;x<wrd.length;x++){
                        if(wrd[x].word==word){
                            wrd[x].count += 1;
                            res.total_word_count +=1;
                            found = true;
                        }
                    }
                    if(!found){
                        wrd.push({
                            word:word,
                            count:1,
                            tf:0.0
                        })
                        res.total_words+=1;
                        res.total_word_count +=1;
                    }
                    await ArticleIndex.findOneAndUpdate({doi_id:doi},{
                        words:wrd,
                        total_words:res.total_words,
                        total_word_count:res.total_word_count
                    },{new:true}).then((qry)=>{
                        setTimeout(()=>{
                            // console.log(qry);
                            resolve(true);},100);
                    });
                }else{
                    console.log('>>>>>>>>>>>>>>>>>   WARNING : ' + doi +' not found. Word : ' + word);
                    let obj = {
                        doi:doi,
                        word:word
                    }
                    retryArticleWord.push(obj);
                    resolve(true);
                }
            });
        }
    });
}


function graphWords(doi,data){
    return new Promise(async (resolve)=>{
        console.log(doi);
        // console.log(JSON.stringify(data));
        for(let x=0;x<data.length;x++){
            let word = data[x];
            await indexWord(word,doi);
            // console.log('Done 1 - ' + word + ' | ' + doi)
            await indexArticleWord(word,doi)
            // console.log('Done 2 - ' + word + ' | ' + doi)
            resolve('ok');
        }
    })
    
}

function processRetryIndexWord(){
    return new Promise(async (resolve)=>{
        if(retryIndexWord.length!=0){
            console.log('========= Processing retryIndexWord ===========')
            for(let x=0;x<retryIndexWord.length;x++){
                doi = retryIndexWord[x].doi;
                word = retryIndexWord[x].word;
                console.log(word);
                await indexWord(word,doi);
                setTimeout(()=>{},200);
            }
            console.log('========= Processing retryIndexWord : COMPLETE ===========');
            retryIndexWord = [];
        }
        resolve(true)
    })
}

function processRetryArticleWord(){
    return new Promise(async (resolve)=>{
        if(retryArticleWord.length!=0){
            console.log('========= Processing retryArticleWord ===========')
            for(let x=0;x<retryArticleWord.length;x++){
                doi = retryArticleWord[x].doi;
                word = retryArticleWord[x].word;
                console.log(doi);
                await indexArticleWord(word,doi);
                setTimeout(()=>{},200);
            }
            console.log('========= Processing retryArticleWord : COMPLETE ===========');
            retryArticleWord = [];
        }
        resolve(true)
    })
}

// function graphWords(doi,data){
//     return new Promise(async (resolve)=>{
//         data.forEach(async (word)=>{
//             if(!isNumeric(word)){
//                 await indexWord(word,doi)
//                 .then(async ()=>{
//                     await indexArticleWord(word,doi);
//                 })
//                 .then(()=>{resolve(true);});    
//             }else{
//                 resolve(true);
//             }
//         })
//     })
    
// }

// function TFrateUpdate(doi){
//     return new Promise(async (resolve)=>{
//         let Article = await ArticleIndex.findOne({doi_id:doi});
//         let totalWords = Article.total_words;
//         let arr = Article.words;
//         arr.forEach((item)=>{
//             item.tf = parseFloat(item.count/totalWords);
//         })
//         console.log(arr);
//         await ArticleIndex.findOneAndUpdate({doi_id:doi},{words:arr});
//         resolve(true);
//     })
// }


function processArticle(article){
    return new Promise((resolve,reject)=>{
        let doi = article.doi_id;
        doiArray.push(doi);
        // if(!findArticle(doi)){
        let title = cleanText(article.title);
        let abstract = cleanText(article.abstract);
        let s1 = new Promise(async (resolve)=>{
            await graphWords(doi,title);
            resolve(true);
        })
        let s2 = new Promise(async (resolve)=>{
            // console.log(abstract.length);
            if(abstract.length>0){
                await graphWords(doi,abstract);
            }
            // console.log('Done 3')
            resolve(true);
        })
        // }
        Promise.all([s1, s2]).then(() => {
            console.log('Index Update: ' + doi + ' >>> Complete');
            resolve(true);
        });
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

// async function MainProcessArticle(article){
//     return new Promise((resolve)=>{

//         let s1 = new Promise(async (resolve)=>{
//             await addArticleToDb(article)
//                 .then((prom)=>{console.log(prom)})
//                 .then(()=>{
//                     setTimeout(()=>{
//                         resolve(true)
//                     },1000*30);
//                 });
            
//         })
//         let s2 = new Promise(async(resolve)=>{
//             await processArticle(article)
//             .then((prom)=>{console.log(prom)})
//             .then(()=>{resolve(true)}); //add to index
//         })
//         let s3 = new Promise(async(resolve)=>{
//             arrLogArticle.push(article.doi + 'v' + article.version + ': ' + article.title);
//             resolve(true);
//         })
        
//         Promise.all([s1,s2,s3]).then(() => {
//             resolve(true);
//         });
//     })
// }

async function saveDb(json,dateArticles){
    return new Promise(async (resolve)=>{
        let collection = json.collection;
        for(x=0;x<collection.length;x++){
            let article = collection[x];
            //console.log(article.doi + ' v' + article.version + ' >> ' + await articleExistsInDb(article));
            if(!await articleExistsInDb(article)){
                await addArticleToDb(article)
                    .then(()=>{resolve(true)})
            }
            else{
                resolve(true);
            }
        }
    })
}

async function buildIndex(json,dateArticles){
    return new Promise(async(resolve)=>{
        let collection = json.collection;
        for(let x=0;x<collection.length;x++){
            let article = collection[x];
            article.doi_id = cleanArticle(article.doi,article.version);
            // console.log(article.doi_id)
            await processArticle(article);
        }
        await processRetryIndexWord();
        await processRetryArticleWord();
        // setTimeout(()=>{},3000)
        // doiArray.forEach(async (doi)=>{
        //     console.log(doi)
        //     await TFrateUpdate(doi);
        // })
        doiArray = [];
        resolve(true);
    })
}

async function fetchArticles(dateArticles,sourceDb){
    return new Promise(async (resolve)=>{
        let prov = [];
        let exit = true;
        let numArticles = 0
        let json = await get_request(dateArticles,numArticles,sourceDb);
        let totalArticles = json.messages[0].total;
        let reportArticles = totalArticles;
        // console.log('Stage 0 totalArticles>>' + totalArticles);
        // console.log('Stage 0 reportArticles>>' + reportArticles);
        // console.log('Stage 0 numArticles>>' + numArticles);
        // console.log(json)
        if(totalArticles!=undefined){
            json.collection.forEach((j)=>{
                prov.push(j.doi);
            })
            console.log(prov);
        }
        if(totalArticles>0&&totalArticles!=undefined){
            await saveDb(json,dateArticles).then((prom)=>{console.log('PROM SaveDB > ' + prom)})
            .then(async ()=>{
                await buildIndex(json,dateArticles).then((prom)=>{console.log('PROM BuildIndex > ' + prom)});
            });
    
            if(totalArticles>99){
                totalArticles -= 100;
                numArticles = 100
                // console.log('Stage 1 totalArticles>>' + totalArticles);
                // console.log('Stage 1 reportArticles>>' + reportArticles);
                // console.log('Stage 1 numArticles>>' + numArticles);
                while(totalArticles > 0){
                    json = await get_request(dateArticles,numArticles,sourceDb);
                    await saveDb(json,dateArticles).then((prom)=>{console.log('PROM SaveDB > ' + prom)})
                    .then(async ()=>{
                        await buildIndex(json,dateArticles).then((prom)=>{console.log('PROM BuildIndex > ' + prom)});
                    });
                    numArticles += 100;
                    totalArticles-=100;
                    // console.log('Stage n totalArticles>>' + totalArticles);
                    // console.log('Stage n reportArticles>>' + reportArticles);
                    // console.log('Stage n numArticles>>' + numArticles);
                }
            }
        }
        resolve(reportArticles);
    })
}

async function runUpdate(dateArticles,flg=''){  
    if(flg=''){
        if(dateArticles==undefined){
            dateArticles = dateNow();
        }else{
            dateArticles = dateNow(dateArticles);
        }
    }
    let totalArticlesUpdated = 0;
    for(let xx=0;xx<arrServers.length;xx++){
        server = arrServers[xx];
        counter = 0;
        arrLogArticle = [];
        content = '\n' +'Processing '+dateArticles+' : '+ timeNow() + ' >> Update from Server -> ' + server;
        console.log(content);
        await fetchArticles(dateArticles,server).then((prom)=>{
            if(prom==undefined){
                prom = 0;
            }
            console.log('Fetch1: ' + prom);
            counter = prom;
            totalArticlesUpdated+=prom;
        });
        if(arrLogArticle.length>0){
            logEvent('\n=====================================================================================' + content);
            arrLogArticle.forEach((art)=>{
                console.log('ART >> ' + art);
                logEvent('\n' + art);
            });
        }
        // totalArticlesUpdated += arrLogArticle.length;
        content = '\n' + 'Total Updates > '+ counter;
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

async function DBImportDateRange(){
    const arrDates = catchDates(startDate,endDate);
    counter=0;
    for(let x=0;x<arrDates.length;x++){
        console.log('Processing Date :'+ arrDates[x] + '=========================================')
        await runUpdate(arrDates[x],'dateRange').then((res)=>{counter+=res;});
        console.log('Date: '+ arrDates[x] + ' >>> COMPLETE');
    }
    console.log('========= IMPORT COMPLETE : Total Articles > '+counter+' Updated ===========')
}

// async function DBUpdateListener(){
//     let imp = await loadSearchIndex();
//     if(imp){
//         console.log('Import files to index: Done')
//     } else{
//         console.log('Error: Failure on import files to Index variables')
//     };
//     let totalUpdated = await runUpdate(yesterday);
//     totalUpdated += await runUpdate();
//     if(totalUpdated>0){
//         await saveSearchIndex()
//         .then(()=>{
//             SearchIndex = {};
//             SI1 = {};
//             SI2 = {};
//             SI3 = {};
//             SI4 = {};
//             SI5 = {};
//         })
//         .then(()=>{console.log('All DBs Saved and Memory free > Total Update: ' + totalUpdated)});
//     }else{
//         SearchIndex = {};
//         SI1 = {};
//         SI2 = {};
//         SI3 = {};
//         SI4 = {};   
//         SI5 = {};
//         console.log('No Changes on the SI files. Memory free > Total Update: ' + totalUpdated)
//     }
//     console.log('========== task complete =============');
// }

// async function testFunction(){
//     let arr = [
//         {word:'Desterro',doi:'11112'},
//         {word:'Desterro',doi:'11113'},
//         {word:'Desterro',doi:'11112'},
//         {word:'Desterro',doi:'11111'},
//         {word:'Sossego',doi:'11112'},
//         {word:'Sossego',doi:'11113'},
//         {word:'Maneiro',doi:'11111'},
//         {word:'Maneiro',doi:'11112'},
//         {word:'Tolice',doi:'11111'},
//         {word:'Tolice',doi:'11112'},
//         {word:'Desrespeito',doi:'11111'},
//         {word:'Desrespeito',doi:'11112'},
//         {word:'Fulisse',doi:'11113'},
//         {word:'Ambrejo',doi:'11114'},
//         {word:'Sossego',doi:'11111'},
//         {word:'Desterro',doi:'11115'},
//         {word:'Tolice',doi:'11116'},
//         {word:'Desterro',doi:'11111'},
//         {word:'Sossego',doi:'11111'},
//         {word:'Maneiro',doi:'11111'},
//         {word:'Tolice',doi:'11111'},
//         {word:'Desrespeito',doi:'11112'},
//         {word:'Fulisse',doi:'11113'},
//         {word:'Ambrejo',doi:'11114'},
//         {word:'Sossego',doi:'11111'},
//         {word:'Desterro',doi:'11115'},
//         {word:'Tolice',doi:'11116'}

//     ]
//     for(const item of arr){
//         const result = await indexWord(item.word,item.doi);
//         console.log(result);
//     }
//     console.log('Process Complete');
//     return;
// }


(async ()=>{
    // let s1 = new Promise(async (resolve)=>{
        
    //     console.log('Load arrIdxWords Complete');
    //     resolve(true);
    // })
    // let s2 = new Promise(async (resolve)=>{
        
    //     console.log('Load arrIdxArticles Complete');
    //     resolve(true);
    // })
    // Promise.all([s1, s2]).then(() => {
        
    // });
    arrIdxWords = await WordIndex.distinct("word");
    arrIdxArticles = await ArticleIndex.distinct("doi_id");
    console.log(arrIdxWords);
    console.log(arrIdxArticles);
    DBImportDateRange();
    // arrIdxWords = await WordIndex.distinct("word");
    // arrIdxArticles = await ArticleIndex.distinct("doi_id");
    // DB Updater a correr diariamente
    // DBUpdateListener()
    // setInterval(async ()=>{
    //     DBUpdateListener()
    // }, 1000*60*60); //60min
    
    //Import Date Range
    
    // console.log(arrIdxWords.includes('guttatus'))
    // testFunction();

    
})();
