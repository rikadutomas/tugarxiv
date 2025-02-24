require('dotenv').config()
const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);
const Schema = mongoose.Schema;

let noteSchema = new Schema({
    title: String,
    description: String,
});

var Note = mongoose.model('tblnotes', noteSchema);


module.exports = Note;