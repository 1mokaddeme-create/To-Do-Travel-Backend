const mongoose = require("mongoose")


const usersDestinationsSchema = new mongoose.Schema({
    user:{
        _id: mongoose.Schema.Types.ObjectId,
        name: String,
        email: String,
        phoneNumber: String,
    },
    destination: {type:String, required:true},
    date: String
})

module.exports = mongoose.model("usersDestinations", usersDestinationsSchema)