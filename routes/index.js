const express = require("express");
const router = express.Router();

// need these imports for user login
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");

const User = require("../models/user");
const Post = require("../models/post");

// Uses PassportJS to log the user in locally
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      // find the user corresponding to the entered username
      const user = await User.findOne({
        username: username,
      });

      if (!user) {
        // if the user doesn't exist, login fails
        return done(null, false, { message: "Incorrect username" });
      } else {
        // otherwise, compare the passwoord
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

// these are also for passportJS setup
router.use(session({ secret: "cats", resave: false, saveUninitialized: true }));
router.use(passport.initialize());
router.use(passport.session());

// once a user is logged in, that user will be stored in the currentUser variable for ease
router.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  next();
});

/* GET sign in page. */
router.get("/sign-in", function (req, res, next) {
  res.render("sign-in");
});

// GET create new user page
router.get("/create-new-user", function (req, res, next) {
  res.render("create-new-user");
});

// POST create new user
router.post("/create-new-user", [
  // first, sanitize submitted data
  body("firstname")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("First name must be specified."),
  body("lastname")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Last name must be specified."),
  body("username")
    .trim()
    .isEmail()
    .escape()
    .withMessage("Username should be an email")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("User name must be specified."),
  body("password")
    .trim()
    .isLength({ min: 4 })
    .escape()
    .withMessage("Password must be at least four characters."),
  async (req, res, next) => {
    const errors = validationResult(req);
    // check for errors from validation
    if (!errors.isEmpty()) {
      // if there are errors, return to the page with the user's inputted information plus errors
      res.render("create-new-user", {
        username: req.body.username,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        password: req.body.password,
        errors: errors.array(),
      });
    } else {
      // otherwise, try to set up the user by hashing the password with bcrpyt
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
            await user.save();
            res.redirect(`/`);
          } catch (err) {
            return next(err);
          }
        }
      });
    }
  },
]);

// POST method for sign-in - once a user has attempted loggedin, sends them to the home page (which will either be the sign-in page  again, if the login failed,  or the app homepage if they succeed)
router.post(
  "/sign-in",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/",
  })
);

router.get("/", async (req, res) => {
  // gets the main page - either the app main page or the sign in, depending on whether the user is signed in or not
  const currentUser = res.locals.currentUser;
  // checks to see if a user is signed in
  const loggedIn = currentUser || req.query.guest;
  // checks to see if a user is logged in, or if there has been a sign-in: either way we'll display the main page rather than the sign in
  let posts = await Post.find({})
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

  // makes a query for all posts, and populates their info so it can display

  if (currentUser) {
    posts = posts.filter(
      (post) =>
        post.author._id.equals(currentUser._id) ||
        currentUser.friends.includes(post.author._id)
    );
  }
  // if a user is logged in, we filter the posts to only show the ones from them or their friends;

  res.render("home", {
    loggedIn: loggedIn,
    currentUser: currentUser,
    posts: posts,
  });
});

// allows the user to log out
router.get("/log-out", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

module.exports = router;
