require('dotenv').config()
const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);
const dbname = 'tugarxiv';
const mongoOptions = { useNewUrlParser: true, useUnifiedTopology: true};
const MDB_ACCESS = process.env.MDB_ACCESS;

function connect(){
    mongoose.connect(MDB_ACCESS,mongoOptions)
    .then(() => {console.log('DB connection established')})
    .catch((err) => {console.log('DB connection error:', err)});
}

module.exports = {connect};



