var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var schema = new Schema({
    image: {type: String, required: true}
});

module.exports = mongoose.model('Clipart', schema);