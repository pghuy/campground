const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    }
});

userSchema.plugin(passportLocalMongoose) // dòng này sẽ auto add username and filed for password
// in the above schema , make sure username is unique and
module.exports = mongoose.model('User', userSchema);

