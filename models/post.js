const mongoose = require("mongoose");

const postSchema = mongoose.Schema({
  content: { type: String, required: true, maxLength: 1000 },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  likes: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ],

  comments: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Comment", required: true },
  ],
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
