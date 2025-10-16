const mongoose = require("mongoose")

const destinationsSchema = new mongoose.Schema({
    name: String,
    description: String,
    image: String
})

module.exports = mongoose.model("destinations", destinationsSchema)