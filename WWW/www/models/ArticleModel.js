require('dotenv').config()
const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);
const Schema = mongoose.Schema;

let articleSchema = new Schema({
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

var Article = mongoose.model('tblarticles', articleSchema);


module.exports = Article;