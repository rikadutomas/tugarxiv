require('dotenv').config()
const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);
const Schema = mongoose.Schema;

// const MONGO_USER = process.env.MONGO_USER;
// const MONGO_PASS = process.env.MONGO_PASS;
// const IP_ADDRESS = process.env.IP_ADDRESS;

// mongoose.connect('mongodb://' + MONGO_USER + ':' + MONGO_PASS +'@'+ IP_ADDRESS +'/tugarxiv',{ useNewUrlParser: true, useUnifiedTopology: true})
//     .then(() => console.log('DB connection established'))
//     .catch(err => console.log('DB connection error:', err));


function dateToday(){
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    today = yyyy + '-' + mm + '-' + dd;
    return today
}

let userSchema = new Schema({
    name: {
        type: String,
        required: true,
        max: 30
    },
    email: {
        type: String,
        required: true,
        unique: true     
    },
    password: {
        type: String,
        required: true     
    },
    profile: {
        type: String,
        default: 'user'
    },
    replacePass: {
        type: String,
        default: false
    },
    favorites:{
        type:Array,
        default:[]
    },
    notes:{
        type:Array,
        default:[]
    },
    date:{
        type:String,
        default:dateToday()
    }

});

var User = mongoose.model('tblUser', userSchema);

module.exports = User;