const mongoose = require("mongoose")

const usersToursSchema = new mongoose.Schema({
    user:{
            _id: mongoose.Schema.Types.ObjectId,
            name: String,
            email: String,
            phoneNumber: String,
        },
    tour:{
        _id:mongoose.Schema.Types.ObjectId,
        name:String,
    },
    members: {type:Number, min:1},
})

module.exports = mongoose.model("usersTours",usersToursSchema)