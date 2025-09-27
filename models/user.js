const mongoose = require('mongoose');


//Schema
const schema = new mongoose.Schema({
    shortId :{
        type: String,
        required : true,
        unique : true
    },
    redirectURL :{
        type : String,
        required : true
    },
    visitHistory : [{timestamp : {type : Number}}],
    createdBy : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Authuser"
    }

},{timestamps : true});

const URL = mongoose.model("URL", schema);

module.exports = URL;