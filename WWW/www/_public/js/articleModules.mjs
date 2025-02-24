var RecentArticles = '';
var MostViewedArticles = '';
var MainStatistics = '';

function getServerIcon(server){
    if(server=='medrxiv'){
        return './icons/med_symbol.png'
    }else{
        return './icons/bio_symbol.png'
    }
}

function getRecentArticles(){
    return new Promise((resolve,reject)=>{
        if(RecentArticles==''){
            document.getElementById('IndexPageArticles').innerHTML = 'Building the results for you...';
            fetch('/Articles/recent',{method : 'post'})
            .then(res=>res.json())
            .then(data => {
                let out = '';
                data.forEach(article => {
                    if(article.authors.length > 200){
                        article.authors = article.authors.substring(0,200) + ' (...)';
                    }
                    let articleHtml = `
                    <a href="/search?doi=${article.doi_id}">
                        <div class="results-cat" id="${article.doi_id}">
                            <div class="results-cat-left">
                                <div class="results-cat-img">
                                    <img src="${getServerIcon(article.server)}">
                                </div>
                                <div class="results">
                                    <h4>${article.title}</h4>
                                    <h5 id="authors-line">${article.authors}</h5>
                                    <div class="row-doi-cat">
                                        <h6><b>DOI:</b> ${article.doi}</h6>
                                        <h6><b>Category:</b> ${article.category}</h6>
                                    </div>
                                </div>
                            </div>
                            <div class="date-res-cat">
                                <h6>${article.date}</h6>
                                <h3>Version: ${article.version}</h3>
                            </div>
                        </div>
                    </a>
                    `
                    out = out + articleHtml;
                });
                RecentArticles = out;
                document.getElementById('IndexPageArticles').innerHTML = out;
            });
        }
        else{
            document.getElementById('IndexPageArticles').innerHTML = RecentArticles;
        }
        
        
    });
}

function getMostViewedArticles(){
    if(MostViewedArticles==''){
        document.getElementById('IndexPageArticles').innerHTML = 'Building the results for you...';
        fetch('/articles/getmostviewed')
        .then((qry)=>{
            return qry.json();
        })
        .then((qry)=>{
            if(qry.result=='ok'){
                let usage = qry.usage;
                let articles = qry.articles;
                let out ='';
                usage.forEach(u=>{
                    let views = u.count;
                    for(let x=0;x<articles.length-1;x++){
                        if(articles[x].doi==u._id){
                            let article = articles[x];
                            let articleHtml = `
                                <a href="/search?doi=${article.doi_id}">
                                    <div class="results-cat" id="${article.doi_id}">
                                        <div class="results-cat-left">
                                            <div class="results-cat-img">
                                                <img src="${getServerIcon(article.server)}">
                                            </div>
                                            <div class="results">
                                                <h4>${article.title}</h4>
                                                <h5 id="authors-line">${article.authors}</h5>
                                                <div class="row-doi-cat">
                                                    <h6><b>DOI:</b> ${article.doi}</h6>
                                                    <h6><b>Category:</b> ${article.category}</h6>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="date-res-cat">
                                            <h6>${article.date}</h6>
                                            <h3>Version: ${article.version}</h3>
                                            <h3>Total Views: ${views}</h3>
                                        </div>
                                    </div>
                                </a>
                            `
                            out = out + articleHtml;
                        }
                    }
                })
                MostViewedArticles = out;
                document.getElementById('IndexPageArticles').innerHTML = out;
            }
            else{
                document.getElementById('IndexPageArticles').innerHTML = '<h6>No results to show</h6>';
            }
        });
    }else{
        document.getElementById('IndexPageArticles').innerHTML = MostViewedArticles;
    }   
}
function getIndexStatistics(){ 
    if(MainStatistics==''){
        document.getElementById('IndexPageArticles').innerHTML = 'Building the results for you...';
        fetch('/articles/getmainstatistics')
        .then((qry)=>{
            return qry.json();
        })
        .then((qry)=>{
            if(qry.result=='ok'){
                let categories = qry.categories;
                let servers = qry.servers;
                let totalCategories = categories.length;
                let totalBio = servers[0].count;
                let totalMed = servers[1].count;
                let totalArticles = totalBio + totalMed;
                let date = qry.firstArticleDate;
                let out = ''

                let htmlTxt = `
                <div class="stat-container">
                    <div class="stat-txt">
                        <table>
                            <tr><td class="tbl-bold">Total Articles:</td><td>${totalArticles}</td></tr>
                            <tr><td class="tbl-bold">Total Articles Biorxiv:</td><td>${totalBio}</td></tr>
                            <tr><td class="tbl-bold">Total Articles Medrxiv:</td><td>${totalMed}</td></tr>
                            <tr><td class="tbl-bold">Date of First Article:</td><td>${date}</td></tr>
                            <tr><td class="tbl-bold">Total Categories:</td><td>${totalCategories}</td></tr>
                        </table>
                    </div>
                    
                `
                let tblHeader = `
                <div class="stat-tbl-container">
                        <table>
                            <thead>
                                <tr>
                                    <th class="tbl-left">Category</th><th class="tbl-center">Total Articles</th><th class="tbl-center">DB Weight %</th>
                                </tr>
                            </thead>
                            <tbody>
                `

                let tblFooter = `
                            </tbody>
                        </table>
                    </div>
                </div>
                `
                for(let x=0;x<11;x++){
                    let perc = ((categories[x].count/totalArticles)*100).toFixed(2);
                    out = out + `<tr><td class="tbl-left">${categories[x]._id}</td><td class="tbl-center">${categories[x].count}</td><td class="tbl-center">${perc}</td></tr>`;
                    
                }

                let totalHtml = htmlTxt + tblHeader + out + tblFooter
                MainStatistics = totalHtml;
                document.getElementById('IndexPageArticles').innerHTML = totalHtml;
            }
            else{
                document.getElementById('IndexPageArticles').innerHTML = '<h6>No results to show</h6>';
            }
        });
    }else{
        document.getElementById('IndexPageArticles').innerHTML = MainStatistics;
    }  
}

export {getServerIcon,getRecentArticles,getMostViewedArticles,getIndexStatistics};