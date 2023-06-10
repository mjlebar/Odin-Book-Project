const mongoose = require("mongoose");

const commentSchema = mongoose.Schema({
  content: { type: String, required: true, maxLength: 500 },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  likes: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ],
});

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
