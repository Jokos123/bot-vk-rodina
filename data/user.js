const mongoose = require('mongoose');
const schema = mongoose.Schema({
    id: Number,
    language: { type:String, default:"ru" }
});
module.exports = mongoose.model("User", schema)