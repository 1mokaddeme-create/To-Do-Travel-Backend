const mongoose = require("mongoose")

const ToursSchema = new mongoose.Schema({
    name: {type: String, required:true},
    description: String,
    price: String,
    date: String,
    image: String,
    images: [String],
})

module.exports = mongoose.model("tours", ToursSchema);