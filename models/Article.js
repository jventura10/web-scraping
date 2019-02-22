var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

var ArticleSchema = new Schema({
    headline: {
      type: String,
      required: true,
      index: {
        unique: true
      },
      validate: [
        function (input) {
            return input.length >= 1;
        },
        "Headline should be longer."
      ]
    },
    summary: {
      type: String,
      required: true,
      validate: [
        function (input) {
            return input.length >= 1;
        },
        "Summary should be longer."
      ]
    },
    link: {
      type: String,
      required: true,
      validate: [
        function (input) {
            return input.length >= 1;
        },
        "Link should be longer."
      ]
    },
    notes: []
  });
  
  // This creates our model from the above schema, using mongoose's model method
  var Article = mongoose.model("Article", ArticleSchema);
  
  // Export the Article model
  module.exports = Article;