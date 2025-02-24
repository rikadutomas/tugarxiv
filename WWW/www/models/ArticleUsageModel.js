require('dotenv').config()
const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);
const Schema = mongoose.Schema;


function dateToday(){
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    today = yyyy + '-' + mm + '-' + dd;
    
    let out = {
        today:today,
        year:yyyy,
        month:mm,
        day:dd
    }
    
    return out;
}

let ArticleUsageSchema = new Schema({
    doi_id: {
        type: String
    },
    doi: {
        type: String
    },
    version: {
        type: String  
    },
    category: {
        type: String
    },
    date:{
        type:String,
        default:dateToday().today
    },
    year:{
        type:String,
        default:dateToday().year
    },
    month:{
        type:String,
        default:dateToday().month
    },
    day:{
        type:String,
        default:dateToday().day
    }

});

var ArticleUsage = mongoose.model('tblarticleusage', ArticleUsageSchema);

module.exports = ArticleUsage;