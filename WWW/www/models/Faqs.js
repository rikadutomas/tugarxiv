require('dotenv').config()
const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);
const Schema = mongoose.Schema;

let faqSchema = new Schema({
    faq_id: {
        type: Number,
        required: true,
        unique:true
    },
    question: {
        type: String,
        required: true  
    },
    answer: {
        type: String,
        required: true     
    }
});

var Faq = mongoose.model('tblfaqs', faqSchema);

module.exports = Faq;