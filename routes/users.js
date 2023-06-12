const express = require("express");
const router = express.Router();
const User = require("../models/user");

/* GET users listing. */
router.get("/index", async function (req, res, next) {
  let possibleFriends;
  const currentUser = res.locals.currentUser;
  if (currentUser) {
    possibleFriends = await User.find({
      _id: { $ne: currentUser._id },
    });
    if (currentUser.sentRequests) {
      possibleFriends = possibleFriends.filter(
        (possibleFriend) =>
          !currentUser.sentRequests.includes(possibleFriend._id) &&
          !currentUser.friends.includes(possibleFriend._id)
      );
    }
  } else {
    possibleFriends = await User.find({});
  }
  res.render("index", {
    possibleFriends: possibleFriends,
    currentUser: currentUser,
  });
});

router.get("/:userid", async function (req, res, next) {
  let pendingRequests = [];
  let friends = [];
  const currentUser = res.locals.currentUser;
  populatedUser = await User.findById({ _id: req.params.userid })
    .populate("friends")
    .populate("friendRequests");
  friends = populatedUser.friends;
  if (currentUser && currentUser._id.equals(req.params.userid)) {
    pendingRequests = populatedUser.friendRequests;
  }

  res.render("user", {
    friends: friends,
    pendingRequests: pendingRequests,
    user: populatedUser,
    currentUser: currentUser,
  });
});

module.exports = router;
