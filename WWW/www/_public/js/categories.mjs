var categories_biorxiv = [];
var categories_medrxiv = [];

function getCategories(){
    return new Promise((resolve)=>{
        fetch('/search/getcategories')
        .then((qry)=>{
            return qry.json();
        })
        .then((res)=>{
            console.log(res);
            res.forEach((x)=>{
                let cat = x.values;
                if(cat.length!=0){
                    console.log(cat)
                    let arr = [];
                    cat.forEach((c)=>{
                        console.log('vall: ' + c)
                        let lnk = c.replace(/ /g, '+');
                        let words = c.split(' ');
                        for (let i = 0; i < words.length; i++) {
                            if(words[i]!=''){
                                words[i] = words[i][0].toUpperCase() + words[i].substr(1);
                            }
                        }
                        words = words.join(' ');
                        lnk = '/search?category=' + lnk;
                        arr.push({name:words,link:lnk});
                    });
                    if(x.category=='biorxiv'){
                        categories_biorxiv = arr;
                        localStorage.setItem("cat_biorxiv", JSON.stringify(arr));

                    }else{
                        categories_medrxiv = arr;
                        localStorage.setItem("cat_medrxiv", JSON.stringify(arr));
                    }
                }
            });
        }).then(()=>{
            resolve(true)
        });      
    }) 
}

async function buildCategoriesArray(){
    categories_biorxiv = JSON.parse(localStorage.getItem("cat_biorxiv"));
    categories_medrxiv = JSON.parse(localStorage.getItem("cat_medrxiv"));
    if(categories_biorxiv==null||categories_medrxiv==null){
        await getCategories();
    }
}

function buildCboCategories(server=''){
    let out=[];
    if(server=='biorxiv'){
        categories_biorxiv.forEach((cat)=>{
            out.push(cat.name);
        })
    }else if(server=='medrxiv'){
        categories_medrxiv.forEach((cat)=>{
            out.push(cat.name);
        })
    }else{
        categories_biorxiv.forEach((cat)=>{
            out.push(cat.name);
        });
        categories_medrxiv.forEach((cat)=>{
            out.push(cat.name);
        });
        let result = [];
        out.forEach(function(item) {
            if(result.indexOf(item) < 0) {
                result.push(item);
            }
        });
        out = result.sort();
    }
    return out;
}

function cat_biorxiv(){
    let out = '';
    for(let x=0;x<categories_biorxiv.length;x++){
        let cat_biorxiv = categories_biorxiv[x];
        if(cat_biorxiv.name!=''){
            out = out + '<div class="categories-btn"><div class="categories-btn-wrap"><a href="'+cat_biorxiv.link+'">'+ cat_biorxiv.name +'</a></div></div>';
        }
        else{
            cat_biorxiv.name = '(no category)';
            out = out + '<div class="categories-btn"><div class="categories-btn-wrap"><a href="'+cat_biorxiv.link+'">'+ cat_biorxiv.name +'</a></div></div>';
        }
        
    }
    document.getElementById('tblBiorxiv').innerHTML = out;
}

function cat_medrxiv(){
    let out = '';
    for(let x=0;x<categories_medrxiv.length;x++){
        let cat_medrxiv = categories_medrxiv[x];
        if(cat_medrxiv.name!=''){
            out = out + '<div class="categories-btn"><div class="categories-btn-wrap"><a href="'+cat_medrxiv.link+'">'+ cat_medrxiv.name +'</a></div></div>';
        }else{
            cat_medrxiv.name = '(no category)';
            out = out + '<div class="categories-btn"><div class="categories-btn-wrap"><a href="'+cat_medrxiv.link+'">'+ cat_medrxiv.name +'</a></div></div>';
        }
        
    }
    document.getElementById('tblBiorxiv').innerHTML = out;
}

export {cat_biorxiv,cat_medrxiv,getCategories,buildCategoriesArray,buildCboCategories};