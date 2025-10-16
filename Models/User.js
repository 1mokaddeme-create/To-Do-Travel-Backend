const mongoose = require("mongoose")

const UserSchena = new mongoose.Schema({
    name: String,
    email: {type: String, unique: true},
    password: String,
    phoneNumber: String,
    wilaya: String,
})

module.exports = mongoose.model("User", UserSchena)