require('dotenv').config();
const express = require('express');
const router = express.Router();
const Articles = require('../models/ArticleModel');
const ArticleUsage = require('../models/ArticleUsageModel');


//Recent Articles
router.post('/recent',(req,res)=>{
    let arr = [];
    // date = req.body.date;
    Articles.find().sort({$natural:-1}).limit(40).then((articles)=>{
        articles.forEach((art)=>{
            let article ={
                title:art.title,
                authors:art.authors,
                category:art.category,
                doi:art.doi,
                date:art.date,
                version:art.version,
                server:art.server,
                doi_id:art.doi_id
            }   
            arr.push(article);
        });
        return res.json(arr);
    });
})

router.post('/categories',(req,res)=>{
    let arr = [];
    // date = req.body.date;
    Articles.find().sort({$natural:-1}).limit(40).then((articles)=>{
        articles.forEach((art)=>{
            let article ={
                title:art.title,
                authors:art.authors,
                category:art.category,
                doi:art.doi,
                date:art.date,
                version:art.version,
                server:art.server,
                doi_id:art.doi_id
            }   
            arr.push(article);
        });
        return res.json(arr);
    });
})

async function addView(qry){
    qry=qry[0];
    let View = new ArticleUsage({
        doi_id:qry.doi_id,
        doi:qry.doi,
        version:qry.version,
        category:qry.category,
    })
    View.save();
}

router.post('/searchdoiid',async (req,res)=>{
    let doi = req.body.doi;
    Articles.find({doi_id:doi})
    .then((qry)=>{
        if(qry.length==0){
            return res.json({result:'err'})
        }else{
            addView(qry);
            return res.json({result:'ok',value:qry})
        }
    }).catch((err)=>{
        console.log(err);
    })
})

router.post('/searchdoi',async (req,res)=>{
    let doi = req.body.doi;
    Articles.find({doi:doi}).sort({$natural:-1})
    .then((qry)=>{
        if(qry.length==0){
            return res.json({result:'err'})
        }else{
            return res.json({result:'ok',value:qry})
        }      
    }).catch((err)=>{
        console.log(err);
    })
})

router.post('/getidgroup', async (req,res)=>{
    let articleArray = req.body.id;
    Articles.find({doi_id:{$in:articleArray}}).then((obj)=>{
        return res.json(obj)
    })    
})

router.get('/getmostviewed',async(req,res)=>{
    let arr=[];
    let usage = await ArticleUsage.aggregate([{"$group" : {_id:"$doi", count:{$sum:1}}}]).sort({count:-1}).limit(40)
    usage.forEach(a=>{
        arr.push(a._id);
    })
    let articles = await Articles.find({doi:{$in:arr}});
    console.log(usage);
    console.log(arr);
    console.log(articles)
    let out = {
        result:'ok',
        usage:usage,
        articles:articles
    }
    return res.json(out);
    
})

router.get('/getmainstatistics',async(req,res)=>{
    let categories = await Articles.aggregate([{"$group" : {_id:"$category", count:{$sum:1}}}]).sort({count:-1});
    let servers = await Articles.aggregate([{"$group" : {_id:"$server", count:{$sum:1}}}]).sort({count:-1});
    let firstArticleDate = '2013-11-07';
    let out = {
        result:'ok',
        categories:categories,
        servers:servers,
        firstArticleDate:firstArticleDate
    }
    return res.json(out);
})

module.exports = router;