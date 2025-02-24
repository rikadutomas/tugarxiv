const fs = require('fs');
function readArrayFromFile(location){
    let fileContent = fs.readFileSync(location);
    let array = JSON.parse(fileContent);
    return array;
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

exports.readArrayFromFile = readArrayFromFile;
exports.cleanText = cleanText;