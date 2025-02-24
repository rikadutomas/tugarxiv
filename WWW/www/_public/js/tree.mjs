import * as articleModules from './articleModules.mjs'
import * as ArticleView from './articleview.mjs';

var TreeData = [
    // {"name":"Game Over","type":"directory","id":"1623025873132","child":[]},
    // {"name":"Stomp","type":"directory","id":"1623025873133","child":[]},
    // {"name":"GameOn","type":"directory","id":"1623025873134","child":[
    //     {"name":"blister","type":"directory","id":"2623025873135","child":[]},
    //     {"name":"blister 2","type":"directory","id":"3623025873135","child":[]},
    //     {"name":"blister 3","type":"directory","id":"4623025873135","child":[]},
    //     {"name":"blister 4","type":"directory","id":"5623025873135","child":[]},
    //     {"name":"blister 5","type":"directory","id":"6623025873135","child":[]}
    // ]},
    // {"name":"Lovers Colide","type":"directory","id":"1623025873136","child":[]},
    // {"name":"Bionic","type":"directory","id":"1623025873137","child":[
    //     {"name":"blister","type":"directory","id":"2653025873135","child":[]},
    //     {"name":"blister 2","type":"directory","id":"3623085873135","child":[]},
    //     {"name":"blister 3","type":"directory","id":"4623025873235","child":[]},
    //     {"name":"blister 4","type":"directory","id":"5623025871135","child":[]},
    //     {"name":"blister 5","type":"directory","id":"7623025873135","child":[]},
    //     {"name":"My Lucky Day","type":"directory","id":"1623065789789","child":[
    //         {"name":"Hope is Win","type":"directory","id":"1623065789790","child":[
    //             {"name":"Lets Win Again","type":"directory","id":"1623065789791","child":[]},
    //             {"name":"Speciation and introgression between Mimulus nasutus and Mimulus guttatus","type":"file","doiId":"10.1101/000109","id":"000109.1","notes":""},
    //             {"name":"Linking indices for biodiversity monitoring to extinction risk theory","type":"file","doiId":"10.1101/000760","id":"000760.1","notes":""},
    //             {"name":"Genomic architecture of human neuroanatomical diversity","type":"file","doiId":"10.1101/001198","id":"001198.1","notes":""}
    //         ]}
    //     ]},
    //     {"name":"blister","type":"directory","id":"2623024873135","child":[]},
    //     {"name":"blister 2","type":"directory","id":"3623025893135","child":[]},
    //     {"name":"blister 3","type":"directory","id":"4723025873135","child":[]},
    //     {"name":"blister 4","type":"directory","id":"5633025873135","child":[]},
    //     {"name":"blister 5","type":"directory","id":"8623025873135","child":[]}
    // ]},
    // {"name":"Hello World","type":"directory","id":"1623065789784","child":[]},
    // {"name":"Minecraft","type":"directory","id":"1623065789785","child":[
    //     {"name":"Lets wait and talk","type":"directory","id":"1623065789786","child":[
    //         {"name":"An Adaptive Threshold in Mammalian Neocortical Evolution","type":"file","doiId":"10.1101/001289","id":"001289.2","notes":""}
    //     ]}
    // ]}
]

let RecursiveOut;
let RecursiveArray = [];
let RecursiveId;
let PassArray = [];
let stage = [false,false,false];
let DropFolderId = '';
let zIn=10000;

class DirSchema {
    constructor(name,id) {
        this.name = name;
        this.type = 'directory';
        this.id = id;
        this.child = [];
    }
    updateId(newid){
        this.id = newid;
    }
    schema(){
        let x = {
            name: this.name,
            type: this.type,
            id: this.id,
            child: this.child,
        };
        return x;
    }
}

class FileSchema {
    constructor(doi_id,title) {
        this.id = doi_id;
        this.type = 'file';
        this.title = title;
        this.doi_id = doi_id;
    }
    schema(){
        let x = {
            id:this.id,
            type: this.type,
            title: this.title,
            doi_id: this.doi_id,
        };
        return x;
    }
}


function saveFavorites(){
    return new Promise((resolve)=>{
        fetch('/users/savefavorites', {
            method:'post',
            body: JSON.stringify({
                favorites:TreeData
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
        })
    })
    
}

function loadFavorites(){
    return new Promise((resolve)=>{
        fetch('/users/loadfavorites', {
            method:'post',
            // body: JSON.stringify({
            //     favorites:data
            // }),
            headers: {
                "Content-Type" : "application/json; charset=utf-8"
            }
        }).then((response)=>{
            return response.json();
        }).then((qry)=>{
            if(qry.length==undefined){
                TreeData=[];
            }else{
                TreeData = qry;
            }            
            resolve(qry);
        }).catch((err)=>{
            console.log(err);
        })
    })
    
}

function iterateFolder(obj,start,flg,fld=''){
    return new Promise(resolve=>{
        let stepCounter = -1;
        obj.forEach((element,index,object) => {
            stepCounter++;
            if(element.id==start){
                switch (flg){
                    case 'addFld':
                        element.child.push(fld.schema());
                        break;
                    case 'insFld':
                        element.child.push(fld);
                        break;
                    case 'remFld':
                        object.splice(index,1);
                        break;
                    case 'updFld':
                        element.name = fld;
                        break;
                    case 'updNote':
                        element.notes = fld;
                        break;
                    case 'getId':
                        RecursiveOut = element;
                        break;
                    case 'srtId':
                        let pos = stepCounter+1;
                        obj.splice(pos,0,fld);
                        break;
                }
            }else if(element.type == 'directory'){
                let obj = element.child;
                iterateFolder(obj,start,flg,fld);
            }
        });
    })
}


function addFolder(Tree,fldName,start=''){
    let randId = Date.now().toString();
    let fld = new DirSchema(fldName,randId);
    if(start==''||start==0||Tree.length==0){
        Tree.push(fld.schema());
    }
    else{
        iterateFolder(Tree,start,'addFld',fld);
    }
    return Tree;
}

function remFileOrFolder(Tree,objId){
    iterateFolder(Tree,objId,'remFld');
    return Tree;
}

function updFolder(Tree,objId,folderName){
    iterateFolder(Tree,objId,'updFld',folderName);
    return Tree;
}

window.addArticleToFavorites = (doi_id,title)=>{
    let fl = new FileSchema(doi_id,title);
    TreeData.push(fl);
    saveFavorites();
}


window.moveFolder = (id,localId,flg)=>{
    return new Promise((resolve)=>{
        RecursiveOut = '';
        if(flg=='sort'){
            localId = localId.replace('split','');
        }
        iterateFolder(TreeData,id,'getId');
        setTimeout(()=>{
            iterateFolder(TreeData,id,'remFld');
        },100)
        setTimeout(()=>{
            if(flg=='move'){
                if(localId==0){
                    TreeData.push(RecursiveOut);
                }else{
                    iterateFolder(TreeData,localId,'insFld',RecursiveOut);
                }
            }
            if(flg=='sort'){
                iterateFolder(TreeData,localId,'srtId',RecursiveOut)
            }
        },200)
        setTimeout(()=>{
            resolve('ok');
        },300)
    })
}
window.moveFile = (id,localId)=>{
    return new Promise((resolve)=>{
        RecursiveOut = '';
        iterateFolder(TreeData,id,'getId');
        setTimeout(()=>{
            iterateFolder(TreeData,id,'remFld');
        },100)
        setTimeout(()=>{
            if(localId==0){
                TreeData.push(RecursiveOut);
            }else{
                iterateFolder(TreeData,localId,'insFld',RecursiveOut);
            }
        },200)
        setTimeout(()=>{
            resolve('ok');
        },300)
    })
}

window.treeAddFolder = (id='')=>{
    document.getElementById('float-menu').style.visibility = 'hidden';
    document.getElementById('float-menu').innerHTML = '';
    let out = `
        <div class="req-fld-name">
            <div class="req-fld-name-central">
                <div class="req-fld-name-lbl">Folder Name</div>
                <div class="req-fld-name-input"><input type="text" name="fldname" id="fldname" placeholder="Name..."></div>
                <div class="req-fld-name-btn">
                    <button class="req-fld-name-cancel" onclick="javascript:cancelAction()">Cancel</button>
                    <button class="req-fld-name-ok" id="req-fld-name-ok" type="submit" onclick="javascript:submitAddFolder(fldname.value,${id})">Ok</button>
                </div>
            </div>
        </div>
    `
    document.getElementById('float-menu').innerHTML = out;
    document.getElementById('float-menu').style.visibility = 'visible';
    document.getElementById('fldname').addEventListener("keyup", function(event) {
        if (event.keyCode === 13) {
          event.preventDefault();
          document.getElementById('req-fld-name-ok').click();
        }
      }); 
}

window.treeUpdateFolder = (id)=>{
    document.getElementById('float-menu').style.visibility = 'hidden';
    document.getElementById('float-menu').innerHTML = '';
    let out = ` 
        <div class="req-fld-name">
            <div class="req-fld-name-central">
                <div class="req-fld-name-lbl">New Folder Name</div>
                <div class="req-fld-name-input"><input type="text" name="fldname" id="fldname" placeholder="Name..." tabindex=1 autofocus></div>
                <div class="req-fld-name-btn">
                    <button class="req-fld-name-cancel" onclick="javascript:cancelAction()" tabindex=2>Cancel</button>
                    <button class="req-fld-name-ok" id="req-fld-name-ok" type="submit"  onclick="javascript:submitUpdateFolder(${id},fldname.value)" tabindex=3>Ok</button>
                </div>
            </div>
        </div>
    `
    document.getElementById('float-menu').innerHTML = out;
    document.getElementById('float-menu').style.visibility = 'visible';
    document.getElementById('fldname').addEventListener("keyup", function(event) {
        if (event.keyCode === 13) {
          event.preventDefault();
          document.getElementById('req-fld-name-ok').click();
        }
      }); 
}

window.cancelAction = ()=>{
    document.getElementById('float-menu').style.visibility = 'hidden';
    document.getElementById('float-menu').innerHTML = '';
}

window.treeDeleteFolder = (id)=>{
    document.getElementById('float-menu').style.visibility = 'hidden';
    document.getElementById('float-menu').innerHTML = '';
    
    let out = `
        <div class="req-fld-name">
            <div class="req-fld-name-central">
                <div class="req-fld-name-lbl">Are you sure you want to delete the folder ?</div>
                <div class="req-fld-name-lbl"></div>
                <div class="req-fld-name-btn">
                    <button class="req-fld-name-cancel" onclick="javascript:cancelAction()">Cancel</button>
                    <button class="req-fld-name-ok" type="submit" onclick="submitDeleteFolder(${id})">Ok</button>
                </div>
            </div>
        </div>
    `
    document.getElementById('float-menu').innerHTML = out;
    document.getElementById('float-menu').style.visibility = 'visible';
}

window.submitAddFolder = (fldname,id='')=>{
    document.getElementById('float-menu').style.visibility = 'hidden';
    document.getElementById('float-menu').innerHTML = '';
    if(TreeData.length==undefined){
        TreeData=[];
    }
    if(id==''){
        TreeData = addFolder(TreeData,fldname);
    }else{
        TreeData = addFolder(TreeData,fldname,id);
    }
    setTimeout(()=>{
        saveFavorites();
        load();
    },100);
}

window.submitUpdateFolder = (id,fldname)=>{
    document.getElementById('float-menu').style.visibility = 'hidden';
    document.getElementById('float-menu').innerHTML = '';
    TreeData = updFolder(TreeData,id,fldname);
    setTimeout(()=>{
        saveFavorites();
        load();
    },100);
}

window.submitDeleteFolder = (id)=>{
    document.getElementById('float-menu').style.visibility = 'hidden';
    document.getElementById('float-menu').innerHTML = '';
    TreeData = remFileOrFolder(TreeData,id);
    setTimeout(()=>{
        saveFavorites();
        load();
    },100);
}


function iterateToFolder(tree,id){
    tree.forEach((t)=>{
        if(t.id==id){
            RecursiveOut = t.child;
        }else if(t.type == 'directory'){
            let obj = t.child;
            iterateToFolder(obj,id);
        }
    })
}

function compareArrays(arr1,arr2){
    if(arr1.length!=arr2.length){return false}
    for(let x=0;x<arr1.length;x++){
        if(arr1[x]!=arr2[x]){
            return false
        }
    }
    return true;
}

function getIdGroup(arr){
    return new Promise((resolve)=>{
        if(!compareArrays(PassArray,arr)){
            PassArray = arr;
            fetch('/articles/getidgroup', {
                method:'post',
                body: JSON.stringify({
                    id:PassArray
                }),
                headers: {
                    "Content-Type" : "application/json; charset=utf-8"
                }
            }).then((response)=>{
                return response.json();
            }).then((qry)=>{
                PassArray=[];               
                resolve(qry);
            }).catch((err)=>{
                console.log(err);
            })
        }
    })
    
}

// function htmlListArticle(article){
//     let serverIcon = articleModules.getServerIcon(article.server);
//     if(article.authors.length > 200){
//         article.authors = article.authors.substring(0,200) + ' (...)';
//     }
//     let out = `
//             <div class="related-article" onclick="javascript:showArticle('${article.doi_id}')">
//                 <div class="related-article-content">
//                     <div class="related-article-img">
//                         <img src="${serverIcon}">
//                     </div>
//                     <div class="related-content">
//                         <h4>${article.title}</h4>
//                         <h5>${article.authors}</h5>
//                         <div class="article-doi-category"><h6>DOI: ${article.doi}</h6><h6>Category: ${article.category}</h6></div>
//                     </div>
//                 </div>
//                 <div class="related-date-version">
//                     <h6>${article.date}</h6>
//                     <h3>Version: ${article.version}</h3>
//                 </div>
//             </div>
//     `
//     return out;
// }

// window.showArticleFavorite = async (doi)=>{
//     let title = document.getElementById('container-title').innerHTML
//     document.getElementById('container-results').innerHTML = ArticleView.multipleResultsContainer();
//     document.getElementById('searchresults-container').innerHTML = 'Processing your request. Please wait...';
//     await fetch('/articles/searchdoiid', {
//         method:'post',
//         body: JSON.stringify({
//             doi:doi
//         }),
//         headers: {
//             "Content-Type" : "application/json; charset=utf-8"
//         }
//     }).then((response)=>{
//         return response.json();
//     }).then((qry)=>{
//         if(qry.result=='ok'){
//             let snip = ArticleView.htmlViewArticle(qry.value[0]);
//             let x = `
//             <div class="title-item nolink">${qry.value[0].title}</div>
//             ` 
            
//             title = title + '<div class="title-separator"> > </div>'+ x;
//             document.getElementById('container-results').innerHTML = snip;
//             document.getElementById('container-title').innerHTML = title;
//             ArticleView.runListeners();
//         }else{
//             console.log(qry);
//             document.getElementById('searchresults-container').innerHTML = 'No Results Found';
//         }
//     }).catch((err)=>{
//         console.log(err);
//     })
// }

window.showFolderContent = async (id)=>{
    if(RecursiveId!=id){
        RecursiveOut = '';
        let folderOut = '';
        let fileOut = '';
        let fileArray = [];
        if(id==0){
            RecursiveOut = TreeData;
        }else{
            iterateToFolder(TreeData,id);
        }
        if(RecursiveOut.length>0){
            RecursiveOut.forEach(r=>{
                if(r.type=='directory'){
                    let out = `
                                <div class="fldcontent-fld-item" id="${r.id}" ondblclick="javascript:showFolderContent(${r.id})">
                                    <div class="fldcontent-fld-item-img"><img src="../icons/folder.png" alt="" draggable="false"></div>
                                    <div class="fldcontent-fld-item-lbl">${r.name}</div>
                                </div>
                    `
                    folderOut += out;
                }else{
                    fileArray.push(r.doi_id);
                }
            })
        }
        if(fileArray.length!=0){
            let artArray = await getIdGroup(fileArray);
            artArray.forEach((art)=>{
                let out = ArticleView.htmlViewRelatedTree(art)
                // let out = htmlListArticle(art)
                fileOut += out;
            })
        }
        let foldersLabel = '';
        if(folderOut!=''){
            foldersLabel = '<div class="fldcontent-container-lbl">Folders</div>';
        }
        let filesLabel = '';
        if(fileOut!=''){
            filesLabel = '<div class="fldcontent-container-lbl">Files</div>';
        }
        if(folderOut==''&&fileOut==''){
            foldersLabel = '<div class="fldcontent-container-nocontent">No Content</div>';
        }
        let htmlOut = `
                    <div class="container-fldcontent">
                        ${foldersLabel}
                        <div class="fldcontent-fld-container">
                            ${folderOut}
                        </div>
                        ${filesLabel}
                        <div class="fldcontent-files-content">
                            ${fileOut}
                        </div>
                    </div>
        `
        document.getElementById('container-results').innerHTML = htmlOut;
        reversePath(id);
        updatePath(id);
    }
    StartDragListeners();
}

function loadTree(){
    function countDirs(tree){
        let count = 0;
        tree.forEach((b)=>{
            if(b.type=='directory'){count++};
        })
        return count;
    }
// -----------------------------------------------------------------------------------------------------------------------
    function iterateFolder(tree){
        console.log(tree);
        document.getElementById('tree-content').innerHTML = '';
        let htmlOut = '';
        if(tree.length>0){
            tree.forEach((branch)=>{  
                if(branch.type=='directory'){
                    zIn--;
                    if(branch.child.length==0||countDirs(branch.child)==0){
                        let out = `
                            <div class="dragbox draggable filedropbox" id="f${branch.id}" draggable="true">
                            <li class="tree-item" id="${branch.id}"><div class="toggler">
                                <div class="fld-wrp">
                                    <div class="lbl-fld">
                                        <div class="lbl-fld-img">
                                            <img src="../icons/folder.png" width='12px'>
                                        </div>
                                        <div class="lbl-fld-lbl">${branch.name}</div>
                                    </div>
                                    <div class="btn-folderops">+</div>
                                </div>
                            </div></li>
                            </div>
                            <div class="dragbox draggable splitter" id="split${branch.id}"></div>
                        `
                        htmlOut = htmlOut + out;
                    }else{
                        let child = branch.child;
                        let folderout = iterateFolder(child);
                        let html = `
                            <div class="dragbox draggable filedropbox" id="f${branch.id}" draggable="true">
                            <li class="tree-item" id="${branch.id}"><div class="toggler fld">
                                <div class="fld-wrp"><div class="lbl-fld">
                                    <div class="lbl-fld-img"><img src="../icons/folder.png" width='12px'></div>
                                    <div class="lbl-fld-lbl">${branch.name}</div>
                                </div>
                                <div class="btn-folderops">+</div>
                            </div></div>
                                <ul class="toggler-target">
                                    ${folderout}
                                </ul>
                            </li>
                            </div>
                            <div class="dragbox draggable splitter"  id="split${branch.id}"></div>
                        `
                        htmlOut = htmlOut + html;
                    }
                }           
            });
        }
        return htmlOut; 
    }
    let htmlOut = iterateFolder(TreeData);
    document.getElementById('tree-content').innerHTML = htmlOut;
}

// -----------------------------------------------------------------------------------------------------------------------

function loadTogglers(){
    const togglers = document.querySelectorAll('.toggler');
    togglers.forEach(toggler=>{
        toggler.addEventListener('click',()=>{
            toggler.classList.toggle('active');
            if(toggler.nextElementSibling){
                toggler.nextElementSibling.classList.toggle('active');
            }       
        })
    })
}

function runBtnOptionsMenu(e){
    event.stopImmediatePropagation();
    let isFavorites = false;
    let id = '';
    if(e.target.className.includes('tree-item')||e.target.className.includes('tree-favorite')){
        if(e.target.className.includes('tree-favorite')){
            isFavorites = true;
        }
        id = e.id;
    }else{
        let tg = e.target.parentNode;
        if (tg.className.includes('tree-item')||tg.className.includes('tree-favorite')){
            if(tg.className.includes('tree-favorite')){
                isFavorites = true;
            }
            id = tg.id;
        }else{
            function iterate(tg){
                if (tg.className.includes('tree-item')||tg.className.includes('tree-favorite')){
                    if(tg.className.includes('tree-favorite')){
                        isFavorites = true;
                    }
                    id = tg.id;
                }else{
                    let x = tg.parentNode;
                    iterate(x)
                }
            }
            iterate(tg);
        }
    }
    let html;        
    if(isFavorites){
        html = `
        <div class="btnfoldermenu" id="btnfoldermenu">
            <div class="btnFolderMenu-item" id="btnFavoriteTreeAddFolder">Add Folder</div>
        </div>
    `
    }else{
        html = `
        <div class="btnfoldermenu" id="btnfoldermenu">
            <div class="btnFolderMenu-item" id="btnTreeAddFolder">Add Folder</div>
            <div class="btnFolderMenu-item" id="btnTreeDeleteFolder">Delete Folder</div>
            <div class="btnFolderMenu-item" id="btnTreeUpdateFolder">Change Name</div>
        </div>
    `
    }
    let Float = document.getElementById('float-menu');
    Float.innerHTML = html;
    Float.style.top = e.target.offsetTop + 'px';
    Float.style.left = e.target.offsetLeft + 'px';
    Float.style.visibility = 'visible';
    document.addEventListener('click',(e)=>{
        event.stopImmediatePropagation();
        switch(e.target.id){
            case 'btnTreeAddFolder':
                treeAddFolder(id);
                break;
            case 'btnFavoriteTreeAddFolder':
                treeAddFolder();
                break;
            case 'btnTreeDeleteFolder':
                treeDeleteFolder(id);
                break;
            case 'btnTreeUpdateFolder':
                treeUpdateFolder(id);
                break;
            default:
                document.getElementById('float-menu').style.visibility = 'hidden';
                document.getElementById('float-menu').innerHTML = '';
                break;
        }
    },{once:true});
}

function reversePath(id){
    if(!RecursiveArray.includes(id)){
        RecursiveArray = [];
        let el = document.getElementById(id);
        RecursiveArray.push(id);
        function iterate(e){
            if(e.className==undefined||e.className.includes('tree-content')){
                return;
            }
            else if(e.className.includes('tree-item')){
                RecursiveArray.push(e.id);
                let x = e.parentNode;
                iterate(x);
            }else{
                let x = e.parentNode;
                iterate(x);
            }
        }
        if(el!=null){
            iterate(el.parentNode);
        }       
    } 
}

function updatePath(id){
    let out = '';
    if(id==0){
        out = '<div class="title-fav" onclick="javascript:showFolderContent(0)">Favorites</div><div class="title-separator"> > </div>';
    }else{
        out = '<div class="title-fav" onclick="javascript:showFolderContent(0)">Favorites</div>';
        let arr = RecursiveArray;
        arr.reverse();
        arr.forEach((item)=>{
                iterateFolder(TreeData,item,'getId');
                let x = `
                <div class="title-item" id="${RecursiveOut.id}" onclick="javascript:showFolderContent(${RecursiveOut.id})">${RecursiveOut.name}</div>
                ` 
                out =out + '<div class="title-separator"> > </div>'+ x;
        })
    }
    document.getElementById('container-title').innerHTML = out;
}

function loadEventListeners(){ 
    let qryy = document.querySelectorAll('.fld-wrp, .tree-favorite')
    qryy.forEach((item)=>{
        item.addEventListener('click',(e)=>{
            let qry = document.querySelectorAll('.tree-item,.tree-toggler, .tree-favorite')
            for(let x=0;x<qry.length;x++){
                qry[x].classList.remove('select');
                if(e.target.className.includes('tree-item')||e.target.className.includes('tree-favorite')){
                    if(e.target.className.includes('tree-favorite')){
                        showFolderContent(0);
                    }else{
                        showFolderContent(e.target.id);
                    }     
                    e.target.classList.add('select');
                }else{
                    let tg = e.target.parentNode;
                    if (tg.className.includes('tree-item')||tg.className.includes('tree-favorite')){
                        if(tg.className.includes('tree-favorite')){
                            showFolderContent(0);
                        }else{
                            showFolderContent(tg.id);
                        } 
                        tg.classList.add('select');
                    }else{
                        function iterate(tg){
                            if (tg.className.includes('tree-item')||tg.className.includes('tree-favorite')){
                                if(tg.className.includes('tree-favorite')){
                                    showFolderContent(0);
                                }else{
                                    showFolderContent(tg.id);
                                } 
                                tg.classList.add('select');
                            }else{
                                let x = tg.parentNode;
                                iterate(x)
                            }
                        }
                        iterate(tg);
                    }
                }             
            }
        },{capture:true});
        item.addEventListener('contextmenu',(c)=>{
            var current = c;
            while (current.parentNode){
                if(current.className.includes('container-tree')){
                    c.preventDefault();
                }
            current = current.parentNode
            }
        })
    })
    let btn = document.querySelectorAll('.btn-ops-favorites, .btn-folderops')
    btn.forEach((item)=>{
        item.addEventListener('click',(e)=>{
            runBtnOptionsMenu(e);
        })
    })

    // -----------------------------------------------------------------------------------------------------------------------

    const draggables = document.querySelectorAll('.draggable');
    const containers = document.querySelectorAll('.dragbox');

    var DropId;
    var DragId;
    var PreviousDropId;
    var PreviousDragId;
    var ActiveToggler='';
    draggables.forEach(draggable=>{
        draggable.addEventListener('dragstart',(e)=>{
            if(e.target.className.includes('fldcontent-fld-item')||e.target.nodeName=='IMG'){
                if(e.target.nodeName=='IMG'){
                    draggable = e.target.parentNode.parentNode;
                    DragId = draggable.id;
                }else{
                    DragId = e.target.id;
                }
            }else{
                DragId = e.target.childNodes[1].id;
            }
            draggable.classList.add('dragging');
        });

        draggable.addEventListener('dragend',async (e)=>{
            e.preventDefault();
            if(e.target.nodeName=='IMG'){
                draggable = e.target.parentNode.parentNode;
            }
            draggable.classList.remove('dragging');
            draggables.forEach(e=>{
                e.classList.remove('overdrag');
            })
            if(PreviousDropId!=DropId && PreviousDragId!=DragId && DragId!=DropId && DropId!='na'){
                PreviousDropId = DropId;
                PreviousDragId = DragId;
                if(DropId!=0 && DropId.includes('split')){
                    await moveFolder(DragId,DropId,'sort').then(()=>{
                        saveFavorites();
                        load();
                    })
                }else{
                    await moveFolder(DragId,DropId,'move').then(()=>{
                        let dest = document.getElementById(DropId)
                        if(DropId!=0 && !dest.className.includes('fld')){
                            dest.classList.add('fld');
                        }
                        saveFavorites();
                        load();
                    })
                }  
            }

            
        });
    })

    containers.forEach(container=>{
        container.addEventListener('dragover',(e)=>{
            e.preventDefault();
            draggables.forEach(draggable=>{
                let togglerdiv;
                if(draggable.className.includes('tree-favorite')){
                    togglerdiv = 'favoritefolder';
                }else if(draggable.className.includes('splitter')){
                    togglerdiv = 'splitter';
                }else if(draggable.className.includes('fldcontent-fld-item')){
                    togglerdiv = 'containerFolder';
                }else{
                    togglerdiv = draggable.childNodes[1].childNodes[0];
                }

                if(draggable.contains(e.target)){
                    draggable.classList.add('overdrag');
                    if(togglerdiv=='favoritefolder'){
                        DropId = 0;
                    }else if(togglerdiv=='splitter'){
                        DropId = draggable.id;
                    }else if(togglerdiv=='containerFolder'){
                        DropId = 'na'
                    }
                    else{
                        DropId = draggable.childNodes[1].id;
                        if(togglerdiv.className.includes('fld')){
                            if(togglerdiv != ActiveToggler){
                                ActiveToggler = togglerdiv;
                                setTimeout(()=>{
                                    if(togglerdiv==ActiveToggler){
                                        togglerdiv.classList.add('active');
                                        if(togglerdiv.nextElementSibling){
                                            togglerdiv.nextElementSibling.classList.add('active');
                                        }                                  
                                    }
                                }, 800);
                                
                            }
                        }
                    }
                }else{
                    draggable.classList.remove('overdrag');
                    if(togglerdiv!='favoritefolder'&&togglerdiv!='splitter'&&togglerdiv!='containerFolder'){
                        if(togglerdiv.className.includes('fld')){
                            togglerdiv.classList.remove('active');
                            if(togglerdiv.nextElementSibling){
                                togglerdiv.nextElementSibling.classList.remove('active');
                            }      
                        }
                    } 
                }
            })
        })
    })
    //------------------------------------------------------------------------------------------------------------------------

}
var DragArray = [];
var DragStart = '';
var DragEnd = '';

function DragIterator(){
    console.log(DragArray);
    let lastPosition = DragArray.length-1;
    let lastValue = DragArray[lastPosition];
    let previousValue = DragArray[lastPosition];
    let out;
    for(let x=lastPosition;x>0;x--){
        console.log('Current - ' + DragArray[x])
        console.log('Last - ' + previousValue);
        if(DragArray[x]==DragArray[lastPosition]&&DragArray[lastPosition]!=previousValue){
            out = DragArray[x+1];
            break;
        }
        previousValue = DragArray[x];
    }


    // while(x>=0){
    //     x--;
    //     if(DragArray[x]==s){
    //         out=DragArray[x+1];
    //         break;
    //     }
    // }
    DragArray = [];   
    console.log('Final - ' + out);
    if(out==undefined){
        out=lastValue;
    }
    return out;
}

function StartDragListeners(){

    let FilesDraggable = document.querySelectorAll('.filedrag')
    let DropBoxes = document.querySelectorAll('.filedropbox');
    
    FilesDraggable.forEach(f=>{
        f.addEventListener('dragstart',()=>{
            DragStart = f.id;
        })
    })
    FilesDraggable.forEach(f=>{
        f.addEventListener('dragend',async (e)=>{      
            DragEnd = DragIterator();
            console.log('Start ' + DragStart)
            console.log('End ' + DragEnd);
            if(DragEnd!=undefined){
                if(DragEnd=='tree-favorite'){
                    DragEnd=0;
                }else{
                    DragEnd = DragEnd.replace('f','');
                }
                await moveFile(DragStart,DragEnd)
                saveFavorites();
                load();
            }
            console.log(TreeData);
            
        })
    })
    DropBoxes.forEach(f=>{
        f.addEventListener('dragover',(e)=>{
            console.log(f.id);
            // xpr.push(f.id);
            DragArray.push(f.id);
        })
    })
}

async function load(){
    if(TreeData.length==0){
        await loadFavorites();
    }
    loadTree();
    loadTogglers();
    showFolderContent(0);
    loadEventListeners();
    console.log('TreeData')
    console.log(TreeData)

}

export {load,loadFavorites};

// function addFile(fileName,doiId,startId){
//     let randId = Date.now().toString();
//     let fld = new FileSchema(fileName,doiId,randId);
//     if(startId==''){
//         Tree.push(fld.schema());
//     }
//     else{
//         iterateFolder(Tree,startId,'addFld',fld);
//     } 
// }

// function updateFileNotes(objId,notes){
//     iterateFolder(Tree,objId,'updNote',notes);
// }

// class FileSchema {
//     constructor(name, doiId = '',id) {
//         this.name = name;
//         this.type = 'file';
//         this.doiId = doiId;
//         this.id = id;
//         this.notes = '';
//     }
//     schema(){
//         let x = {
//             name: this.name,
//             type: this.type,
//             doiId: this.doiId,
//             id: this.id,
//             notes: this.notes
//         };
//         return x;
//     }

// }