var mongoose = require('mongoose'),  
    Schema   = mongoose.Schema;

var modelSchema = new Schema({  
  name:    { type: String },
  password:    { type: String },
  presents : [{
        idea : { type: String },
        user : { type: String }
    }]
});

module.exports = mongoose.model('Model', modelSchema); 