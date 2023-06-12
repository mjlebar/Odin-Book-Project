const express = require("express");
const router = express.Router();
const User = require("../models/user");

router.post("/", async (req, res) => {
  const fromUser = await User.findById(req.body.from_user);
  //   user who sent request
  const toUser = await User.findById(req.body.to_user);
  //   user who receives request (and now needs to accept it)

  const fromUserRequests = fromUser.sentRequests
    ? fromUser.sentRequests.concat([toUser._id])
    : [toUser._id];

  const toUserRequests = toUser.friendRequests
    ? toUser.friendRequests.concat([fromUser._id])
    : [fromUser._id];

  const newFromUser = new User({
    username: fromUser.username,
    firstname: fromUser.firstname,
    lastname: fromUser.lastname,
    password: fromUser.password,
    friends: fromUser.friends,
    friendRequests: fromUser.friendRequests,
    sentRequests: fromUserRequests,
    _id: fromUser._id,
  });
  const newToUser = new User({
    username: toUser.username,
    firstname: toUser.firstname,
    lastname: toUser.lastname,
    password: toUser.password,
    friends: toUser.friends,
    friendRequests: toUserRequests,
    sentRequests: toUser.sentRequests,
    _id: toUser._id,
  });

  await Promise.all([
    User.findByIdAndUpdate(newFromUser._id, newFromUser, {}),
    User.findByIdAndUpdate(newToUser._id, newToUser, {}),
  ]);

  res.redirect("/users/index");
});

module.exports = router;
