require('dotenv').config()
const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);
const Schema = mongoose.Schema;

const SearchIndexSchema = new Schema({
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

const WordIndex = mongoose.model('idxWords',SearchIndexSchema);

module.exports = WordIndex;