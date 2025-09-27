const mongoose = require('mongoose');

const AuthuserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['Admin', 'Normal'],
        default: 'Normal'
    }
    
}, { timestamps: true });

const Authuser = mongoose.model("Authuser", AuthuserSchema);

module.exports = Authuser;