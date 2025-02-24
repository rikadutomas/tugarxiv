import * as articleModules from './articleModules.mjs'

function htmlViewArticle(article){
    let serverIcon = articleModules.getServerIcon(article.server)
    let out = `
                <div class="container-results-left" id="container-results-left">
                    <div class="results-article" id="results-article">
                        <div class="article-top article-draggable" draggable="true">
                            <div class="article-cat-img">
                                <img src="${serverIcon}">
                            </div>
                            <div class="article-cat-details">
                                <div class="article-title-authors">
                                    <h3>${article.title}</h3>
                                    <h4>${article.authors}</h4>
                                </div>
                                <div class="article-cat-doi">
                                    <div class="art-cat">category:${article.category}</div>
                                    <div class="art-doi">doi:${article.doi}</div>
                                </div>  
                            </div>
                            <div class="article-cat-favarea">
                                <div class="fav-details">
                                    <div>Date:${article.date}</div>
                                    <div>Version:${article.version}</div>
                                </div>
                                <div class="article-btns">
                                    <div class="btn-art" onclick="javascript:viewPdfInTab('${article.doi}','${article.version}')">View PDF</div>
                                    <div class="btn-art" onclick="javascript:addArticleToFavorites('${article.doi_id}','${article.title}')">Add Favorites</div>
                                </div>
                            </div>
                        </div>
                        <div class="article-abstract">
                            <b>Abstract: </b>${article.abstract}
                        </div>
                    </div>
                    <div class="related" id="related">
                        <div class="related-top" id="related-top">
                            <div class="related-top-btn related-selected" onclick="javascript:getOtherArticleVersions()">Article Versions</div>
                            <div class="related-top-btn"  onclick="javascript:getRelatedArticles()">Related Articles</div>
                            <div class="related-top-btn" onclick="javascript:getPersonalNotes()">Personal Notes</div>
                            <div class="related-top-btns">
                                
                            </div>
                        </div>
                        <div class="related-content" id="related-content"></div>
                    </div>
                    </div>
                    <div class="div-splitter div-hidden" id="div-splitter">&#9204</div>
                    <div class="container-results-right" id="container-results-right">
                        <div class="pdf-container">
                            <iframe src="https://docs.google.com/viewer?url=https://www.biorxiv.org/content/${article.doi}v${article.version}.full.pdf&embedded=true" frameborder="0" height="500px" width="100%"></iframe>
                        </div>
                    </div>
                </div>
    `
    return out;
}

function htmlInsertTitle(article){
    let out = `
                <div class="container-title-label-main">Article</div>
                <div class="content-title-separator">></div>
                <div class="container-title-label">${article.title}</div>
    `
    return out;
}

function htmlViewRelated(article){
    let serverIcon = articleModules.getServerIcon(article.server);
    if(article.authors.length > 200){
        article.authors = article.authors.substring(0,200) + ' (...)';
    }
    let out = `
        <a href="/search?doi=${article.doi_id}">
            <div class="related-article">
                <div class="related-article-content">
                    <div class="related-article-img">
                        <img src="${serverIcon}">
                    </div>
                    <div class="related-content">
                        <h4>${article.title}</h4>
                        <h5>${article.authors}</h5>
                        <div class="article-doi-category"><h6>DOI: ${article.doi}</h6><h6>Category: ${article.category}</h6></div>
                    </div>
                </div>
                <div class="related-date-version">
                    <h6>${article.date}</h6>
                    <h3>Version: ${article.version}</h3>
                </div>
            </div>
        </a>
    `
    return out;
}

function htmlViewRelatedTree(article){
    let serverIcon = articleModules.getServerIcon(article.server);
    if(article.authors.length > 200){
        article.authors = article.authors.substring(0,200) + ' (...)';
    }
    let out = `
            <div class="related-article filedrag" id="${article.doi_id}" onclick="javascript:showArticle('${article.doi_id}')" draggable="true">
                <div class="related-article-content">
                    <div class="related-article-img">
                        <img src="${serverIcon}">
                    </div>
                    <div class="related-content">
                        <h4>${article.title}</h4>
                        <h5>${article.authors}</h5>
                        <div class="article-doi-category"><h6>DOI: ${article.doi}</h6><h6>Category: ${article.category}</h6></div>
                    </div>
                </div>
                <div class="related-date-version">
                    <h6>${article.date}</h6>
                    <h3>Version: ${article.version}</h3>
                </div>
            </div>
    `
    return out;
}

function multipleResultsContainer(){
    let out = `
            <div class="searchresults-container" id="searchresults-container">
            </div>
    `
    return out;
}

function runListeners(){
    document.getElementById('div-splitter').addEventListener('click',()=>{
        let leftpanel = document.getElementById('container-results-left')
        let rightpanel = document.getElementById('container-results-right')
        let divsplitter = document.getElementById('div-splitter')
        if(divsplitter.classList.contains('div-hidden')){
            leftpanel.style.width = '50%';
            rightpanel.style.width = '50%';
            rightpanel.style.visibility = 'visible';
            divsplitter.innerHTML='&#9205'
            divsplitter.classList.remove('div-hidden')
        }else{
            leftpanel.style.width = '100%';
            rightpanel.style.width = '0%';
            rightpanel.style.visibility = 'hidden';
            divsplitter.innerHTML='&#9204'
            divsplitter.classList.add('div-hidden')
        }
    })

}
export {htmlViewArticle,runListeners,htmlInsertTitle,htmlViewRelated,multipleResultsContainer,htmlViewRelatedTree};

//<iframe sandbox="" src="https://www.biorxiv.org/content/${article.doi}v${article.version}.full.pdf" frameborder="0"></iframe>