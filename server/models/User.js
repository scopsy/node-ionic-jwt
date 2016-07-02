const mongoose  = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: { type: String, unique: true },
    profilePicture: String,

    profiles: {
        facebook: String,
        google: String
    },
    tokens: Array
}, { timestamps: true });


module.exports = mongoose.model('User', userSchema);
