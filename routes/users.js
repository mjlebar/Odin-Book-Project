const express = require("express");
const router = express.Router();
const User = require("../models/user");

// GET users listing,   a listing of possible new friends for the  user

router.get("/index", async function (req, res, next) {
  let possibleFriends;
  // we create this variable and then fill it, but having it defined at the beginning allows us to send it along to the page whether we have a user or a guest sign  in

  const currentUser = res.locals.currentUser;
  if (currentUser) {
    // if there's a user logged in, we first find all the users other than the current user
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
    // then we filter out all the people who are either already friends with the current user, or who have been sent a friend request by the current user
  } else {
    possibleFriends = await User.find({}).limit(15);
    // otherwise, just fill in everyone... then narrow down to the first 15 so the page isn't flooded
  }
  res.render("index", {
    possibleFriends: possibleFriends,
    currentUser: currentUser,
  });
});

router.get("/:userid", async function (req, res, next) {
  // show the specific info for a user - their friends, and any pending friend requests
  let pendingRequests = [];
  let friends = [];
  // we make these empty and then fill them in, so no matter what we send some array to the page - then it will render based on whether it has contents
  populatedUser = await User.findById({ _id: req.params.userid })
    .populate("friends")
    .populate("friendRequests");
  // fill in the  friends and friend requests for the user
  const currentUser = res.locals.currentUser;

  friends = populatedUser.friends;

  if (currentUser && currentUser._id.equals(req.params.userid)) {
    pendingRequests = populatedUser.friendRequests;
    // if the user whose  page we're looking at is the current user, then we will display their friend requests
  }

  res.render("user", {
    friends: friends,
    pendingRequests: pendingRequests,
    user: populatedUser,
    currentUser: currentUser,
  });
});

module.exports = router;
