const mongoose = require('mongoose');
const isEmail = require('validator/lib/isEmail');
const isURL = require('validator/lib/isURL');
const Schema = mongoose.Schema;

const FeedSchema = new Schema({
  title: {
    type: String,
    required: true,
    validate: {
      validator(title) {
        return title && title.trim().length > 0;
      },
      message: '{VALUE} must be not be empty'
    }
  },
  url: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator(url) {
        return isURL(url);
      },
      message: '{VALUE} must be a valid url'
    }
  },
});


FeedSchema.methods.toJSON = function() {
  return {
    id : this._id,
    title: this.title,
    url : this.url
  };
};

module.exports = mongoose.model('Feed', FeedSchema);
