var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var schema = new Schema({
    user: {type : Schema.Types.ObjectId, ref: 'User'},
    cart : {type: Object, required : true},
    address : {type: String, required: true},
    address2 : {type: String, required: true},
    fname: {type: String, required: true},
    lname: {type: String, required: true},
    paymentId : {type: String, required: true},
    pnum : {type: Number, required: true}
});

module.exports = mongoose.model('Order', schema);