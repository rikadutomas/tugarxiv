require('dotenv').config()
const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);
const Schema = mongoose.Schema;

const ArticleIndexSchema = new Schema({
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

const ArticleIndex = mongoose.model('idxArticles',ArticleIndexSchema);

module.exports = ArticleIndex;