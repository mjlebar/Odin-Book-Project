const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Comment = require("../models/comment");
const Post = require("../models/post");

// POST method for /posts, ie method that creates a new post
router.post("/", async (req, res) => {
  const newPost = new Post({
    content: req.body.post_text,
    author: res.locals.currentUser._id,
    likes: [],
    comments: [],
  });

  await Post.create(newPost);

  res.redirect("/");
});

// POST Method for /posts/likes - adds a new  like to a post
router.post("/likes", async (req, res) => {
  const post = await Post.findById(req.body.post_id);

  const newPost = new Post({
    content: post.content,
    author: post.author,
    likes: post.likes.concat([res.locals.currentUser._id]),
    comments: post.comments,
    _id: post._id,
  });

  await Post.findByIdAndUpdate(newPost._id, newPost, {});

  res.redirect("/");
});

// POST Method for /posts/unlikes - removes a like from a post. I'd rather use a DELETE method but you can't do that with forms
router.post("/unlikes", async (req, res) => {
  const post = await Post.findById(req.body.post_id);

  const newLikes = post.likes;
  newLikes.splice(newLikes.indexOf([res.locals.currentUser._id]), 1);
  //   finds and removes the correct like

  const newPost = new Post({
    content: post.content,
    author: post.author,
    likes: newLikes,
    comments: post.comments,
    _id: post._id,
  });

  await Post.findByIdAndUpdate(newPost._id, newPost, {});

  res.redirect("/");
});

// POST method for /comments, adds a new comment
router.post("/comments", async (req, res) => {
  const comment = new Comment({
    content: req.body.comment_text,
    author: res.locals.currentUser._id,
    likes: [],
  });

  const newComment = await Comment.create(comment);
  //   first create the new comment

  const post = await Post.findById(req.body.post_id);

  const newPost = new Post({
    content: post.content,
    author: post.author,
    likes: post.likes,
    comments: post.comments.concat([newComment]),
    _id: post._id,
  });
  //   then update the post it's attached to with the new comment

  await Post.findByIdAndUpdate(newPost._id, newPost, {});
  res.redirect("/");
});

// POST method - adds a new like to a comment
router.post("/comments/likes", async (req, res) => {
  const comment = await Comment.findById(req.body.comment_id);

  const newComment = new Comment({
    content: comment.content,
    author: comment.author,
    likes: comment.likes.concat([res.locals.currentUser._id]),
    _id: comment._id,
  });
  await Comment.findByIdAndUpdate(newComment._id, newComment, {});

  res.redirect("/");
});

// POST method - removes a like from a comment. I'd rather use a DELETE method but you can't do that with forms
router.post("/comments/unlikes", async (req, res) => {
  const comment = await Comment.findById(req.body.comment_id);

  const newLikes = comment.likes;
  newLikes.splice(newLikes.indexOf([res.locals.currentUser._id]), 1);
  //   finds and removes the correct like

  const newComment = new Comment({
    content: comment.content,
    author: comment.author,
    likes: newLikes,
    _id: comment._id,
  });

  await Comment.findByIdAndUpdate(newComment._id, newComment, {});

  res.redirect("/");
});

module.exports = router;
