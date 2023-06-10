const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Comment = require("../models/comment");
const Post = require("../models/post");

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

router.post("/unlikes", async (req, res) => {
  const post = await Post.findById(req.body.post_id);

  const newLikes = post.likes;
  newLikes.splice(newLikes.indexOf([res.locals.currentUser._id]), 1);

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

router.post("/comments", async (req, res) => {
  const comment = new Comment({
    content: req.body.comment_text,
    author: res.locals.currentUser._id,
    likes: [],
  });

  const newComment = await Comment.create(comment);

  const post = await Post.findById(req.body.post_id);

  const newPost = new Post({
    content: post.content,
    author: post.author,
    likes: post.likes,
    comments: post.comments.concat([newComment]),
    _id: post._id,
  });

  await Post.findByIdAndUpdate(newPost._id, newPost, {});

  res.redirect("/");
});

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

router.post("/comments/unlikes", async (req, res) => {
  const comment = await Comment.findById(req.body.comment_id);

  const newLikes = comment.likes;
  newLikes.splice(newLikes.indexOf([res.locals.currentUser._id]), 1);

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
