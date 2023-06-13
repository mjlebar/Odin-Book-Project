const express = require("express");
const router = express.Router();
const User = require("../models/user");

// this manages accepting a request - it removes the request from both users and adds them to each other's friends list
router.post("/", async (req, res) => {
  const fromUser = await User.findById(req.body.from_user);
  //   the user who sent the request
  const toUser = await User.findById(req.body.to_user);
  //   the user who received the request, and has now accepted it

  // remove the request from pending requests for both users
  const fromUserRequestsCopy = fromUser.sentRequests;
  fromUserRequestsCopy.splice(fromUserRequestsCopy.indexOf(toUser._id), 1);

  const toUserRequestsCopy = toUser.friendRequests;
  toUserRequestsCopy.splice(toUserRequestsCopy.indexOf(fromUser._id), 1);

  // add the users as friends
  const fromUserFriends = fromUser.friends
    ? fromUser.friends.concat([toUser._id])
    : [toUser._id];

  const toUserFriends = toUser.friends
    ? toUser.friends.concat([fromUser._id])
    : [fromUser._id];

  // create and update users with new information
  const newFromUser = new User({
    username: fromUser.username,
    firstname: fromUser.firstname,
    lastname: fromUser.lastname,
    password: fromUser.password,
    friends: fromUserFriends,
    friendRequests: fromUser.friendRequests,
    sentRequests: fromUserRequestsCopy,
    _id: fromUser._id,
  });
  const newToUser = new User({
    username: toUser.username,
    firstname: toUser.firstname,
    lastname: toUser.lastname,
    password: toUser.password,
    friends: toUserFriends,
    friendRequests: toUserRequestsCopy,
    sentRequests: toUser.sentRequests,
    _id: toUser._id,
  });

  await Promise.all([
    User.findByIdAndUpdate(newFromUser._id, newFromUser, {}),
    User.findByIdAndUpdate(newToUser._id, newToUser, {}),
  ]);

  res.redirect(`/users/${toUser._id}`);
});

module.exports = router;
