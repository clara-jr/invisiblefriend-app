var mongoose = require('mongoose'),  
    Schema   = mongoose.Schema;

var modelSchema = new Schema({  
  name:    { type: String },
  password:    { type: String },
  groupId:    { type: String },
  date:    { type: String },
  maxPrice:    { type: String },
  invisible:    { type: String },
  visible:    { type: String },
  invisibleMessages : [{
        text : { type: String },
        origin : { type: Boolean }
    }],
  visibleMessages : [{
        text : { type: String },
        origin : { type: Boolean }
  }],
  presents : [{
        idea : { type: String },
        user : { type: String }
    }]
});

module.exports = mongoose.model('Model', modelSchema); 