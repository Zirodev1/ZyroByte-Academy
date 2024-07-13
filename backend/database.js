const mongoose = require('mongoose');

const dbURI = 'mongodb+srv://zirodev:AS81biivSbVCUYPS@cluster0.0dtyd1w.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true})

const db = mongoose. connection;

db.on('errro', console.error.bind(console, "MongoDB connection error:"));
db.once('open', function(){
    console.log("Connected to the database");
});

module.exports = db;