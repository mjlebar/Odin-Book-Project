const express = require("express");
const router = express.Router();
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");

const User = require("../models/user");
const Post = require("../models/post");
const Comment = require("../models/comment");

// Uses PassportJS to log the user in locally
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({
        username: username,
      });

      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      } else {
        bcrypt.compare(password, user.password, (err, res) => {
          if (res) {
            // passwords match! log user in
            return done(null, user);
          } else {
            console.log("this is the issue");
            // passwords do not match!
            return done(null, false, { message: "Incorrect password" });
          }
        });
      }
    } catch (err) {
      return done(err);
    }
  })
);

// the following two functions store the user information in a cookie so we can maintain log-in status
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(async function (id, done) {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

router.use(session({ secret: "cats", resave: false, saveUninitialized: true }));
router.use(passport.initialize());
router.use(passport.session());
router.use(express.urlencoded({ extended: false }));
router.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  next();
});
/* GET sign in page. */
router.get("/sign-in", function (req, res, next) {
  res.render("sign-in");
});

// Get create new user page
router.get("/create-new-user", function (req, res, next) {
  res.render("create-new-user");
});

router.post("/create-new-user", async (req, res, next) => {
  // console.log(req.body);
  bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
    if (err) {
      console.log("Encryption error");
    } else {
      try {
        const user = new User({
          username: req.body.username,
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          password: hashedPassword,
        });
        const result = await user.save();
        res.redirect(`/`);
      } catch (err) {
        return next(err);
      }
    }
  });
});

router.post(
  "/sign-in",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/",
  })
);

router.get("/", async (req, res) => {
  let possibleFriends;
  let pendingRequests;

  const user = res.locals.currentUser;

  const posts = await Post.find({})
    .populate("author")
    .populate({
      path: "comments",
      populate: { path: "author" },
    })
    .populate({
      path: "comments",
      populate: { path: "likes" },
    })
    .populate({ path: "likes" });

  if (user) {
    possibleFriends = await User.find({
      _id: { $ne: user._id },
    });
    if (user.sentRequests) {
      possibleFriends = possibleFriends.filter(
        (possibleFriend) => !user.sentRequests.includes(possibleFriend._id)
      );
    }
    userWithRequests = await User.findById({ _id: user._id }).populate(
      "friendRequests"
    );
    // console.log(userWithRequests);
    pendingRequests = userWithRequests.friendRequests;
    // console.log(pendingRequests);
  }
  res.render("home", {
    user: user,
    posts: posts,
    possibleFriends: possibleFriends,
    pendingRequests: pendingRequests,
  });
});

router.get("/log-out", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

module.exports = router;
