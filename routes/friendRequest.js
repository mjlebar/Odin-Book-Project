const express = require("express");
const router = express.Router();
const User = require("../models/user");

// this function manages sent friend requests - it adds it as pending so the request shows up for the user who received the request, and removes the user who sent it from friend suggestions

router.post("/", async (req, res) => {
  const fromUser = await User.findById(req.body.from_user);
  //   user who sent request
  const toUser = await User.findById(req.body.to_user);
  //   user who receives request (and now needs to accept it)

  const fromUserRequests = fromUser.sentRequests
    ? fromUser.sentRequests.concat([toUser._id])
    : [toUser._id];
    // if there's already an array of sent friend requests, add this one - otherwise, make a new array

  const toUserRequests = toUser.friendRequests
    ? toUser.friendRequests.concat([fromUser._id])
    : [fromUser._id];
    // if there's already an array of received friend requests, add this one - otherwise, make a new array


    // create and update the users with the updated requests
  const newFromUser = new User({
    userName: fromUser.userName,
    firstName: fromUser.firstName,
    lastName: fromUser.lastName,
    password: fromUser.password,
    friends: fromUser.friends,
    friendRequests: fromUser.friendRequests,
    sentRequests: fromUserRequests,
    _id: fromUser._id,
  });
  const newToUser = new User({
    userName: toUser.userName,
    firstName: toUser.firstName,
    lastName: toUser.lastName,
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
